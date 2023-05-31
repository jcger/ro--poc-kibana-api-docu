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
function findRefs(
  obj: OpenAPISpec,
  refs: Set<string>,
  fileRefs: Set<string>,
): void {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      findRefs(obj[key], refs, fileRefs)
    } else if (key === "$ref") {
      if (obj[key].startsWith("#")) {
        refs.add(obj[key])
      } else {
        fileRefs.add(obj[key])
      }
    }
  }
}

// Check whether a spec contains a specific $ref
function checkRef(obj: OpenAPISpec, ref: string): boolean {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (checkRef(obj[key], ref)) {
        return true
      }
    } else if (key === "$ref" && obj[key] === ref) {
      return true
    }
  }
  return false
}

function processFiles(
  entryFilePath: string,
  files: string[],
  basePath: string,
): void {
  const allRefs = new Set<string>()
  const fileRefs = new Set<string>()
  const visitedFiles = new Set<string>()

  // First, find all $ref values in the entry file
  let entryYamlData = loadYamlFile(entryFilePath)
  findRefs(entryYamlData, allRefs, fileRefs)

  while (fileRefs.size > 0) {
    const fileRef = fileRefs.values().next().value
    fileRefs.delete(fileRef)

    if (visitedFiles.has(fileRef)) {
      continue
    }
    visitedFiles.add(fileRef)

    const filePath = path.join(basePath, fileRef)
    console.log("loading file", filePath)
    const yamlData = loadYamlFile(filePath)
    findRefs(yamlData, allRefs, fileRefs)
  }

  // Then, check whether each ref is defined in any of the other files
  for (const ref of allRefs) {
    let found = false
    for (const fileRef of visitedFiles) {
      const filePath = path.join(basePath, fileRef)
      const yamlData = loadYamlFile(filePath)
      if (checkRef(yamlData, ref)) {
        found = true
        break
      }
    }
    if (!found) {
      for (const file of files) {
        const filePath = path.join(basePath, file)
        const yamlData = loadYamlFile(filePath)
        if (checkRef(yamlData, ref)) {
          const relativePath = path.relative(
            path.dirname(entryFilePath),
            filePath,
          )
          const newRef = `./${relativePath}#${ref.slice(1)}`
          console.log("Replacing", ref, "with", newRef, "in", entryFilePath)
          // replaceRef(entryYamlData, ref, newRef)
          // saveYamlFile(entryFilePath, entryYamlData)
          break
        }
      }
    }
  }
}

function replaceRef(obj: OpenAPISpec, oldRef: string, newRef: string): void {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      replaceRef(obj[key], oldRef, newRef)
    } else if (key === "$ref" && obj[key] === oldRef) {
      obj[key] = newRef
    }
  }
}

const main = async ({ sourceDir = "./openapi" }: { sourceDir: string }) => {
  const fileNames = glob.glob.sync(`${sourceDir}/**/*.yaml`, {
    root: sourceDir || process.cwd(),
  })
  fileNames.forEach((file: string) => {
    if (file.endsWith("entrypoint.yaml")) {
      const fileDir = path.dirname(file)
      processFiles(path.join(sourceDir, file), fileNames, fileDir)
    }
  })
}

if (process.env.NODE_ENV !== "test") {
  main({ sourceDir: "." })
}
