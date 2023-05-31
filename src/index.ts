/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import * as glob from "glob"
import * as path from "path"
import { loadYamlFile, saveYamlFile } from "./io"

export interface OpenAPISpec {
  $ref?: string
  [key: string]: any
}

// Recursively find all $ref values in the spec and add them to a set
function findRefs(obj: OpenAPISpec, refs: Set<string>): void {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      findRefs(obj[key], refs)
    } else if (key === "$ref" && obj[key].startsWith("#")) {
      refs.add(obj[key])
    }
  }
}

// Check whether a spec contains a specific $ref, and replace it with the relative file path if so
function replaceRef(
  obj: OpenAPISpec,
  ref: string,
  filePath: string,
  entryFilePath: string,
): boolean {
  let replaced = false
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (replaceRef(obj[key], ref, filePath, entryFilePath)) {
        replaced = true
      }
    } else if (key === "$ref" && obj[key] === ref) {
      obj[key] = path.relative(path.dirname(entryFilePath), filePath)
      replaced = true
    }
  }
  return replaced
}

function processFiles(files: string[], basePath: string): void {
  // Find all entrypoint.yaml files
  const entryFiles = files.filter((file) => file.endsWith("entrypoint.yaml"))
  if (entryFiles.length === 0) {
    console.log("No entrypoint.yaml file found.")
    return
  }

  for (const entryFile of entryFiles) {
    const allRefs = new Set<string>()
    const entryFilePath = path.join(basePath, entryFile)

    // First, find all $ref values in the entry file
    const entryYamlData = loadYamlFile(entryFilePath)
    findRefs(entryYamlData, allRefs)

    // Then, check whether each ref is defined in any of the other files
    for (const ref of allRefs) {
      let found = false
      for (const file of files) {
        if (file !== entryFile) {
          const filePath = path.join(basePath, file)
          const yamlData = loadYamlFile(filePath)
          if (replaceRef(entryYamlData, ref, filePath, entryFilePath)) {
            saveYamlFile(entryFilePath, entryYamlData)
            found = true
            break
          }
        }
      }
      if (!found) {
        console.log(`Undefined $ref found: ${ref} in file: ${entryFilePath}`)
      }
    }
  }
}

const main = async ({ sourceDir = "./openapi" }: { sourceDir: string }) => {
  const fileNames = glob.glob.sync(`${sourceDir}/**/*.yaml`, {
    root: sourceDir || process.cwd(),
  })

  processFiles(fileNames, sourceDir)
}

if (process.env.NODE_ENV !== "test") {
  main({ sourceDir: "." })
}
