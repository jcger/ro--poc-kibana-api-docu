/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exportSpecsAsYaml, getFiles, importFileByTypes } from "./file_io"
import { OpenAPIObject } from "./types/openapi_spec"

/**
 * Searches for missing definitions in an OpenAPI specification.
 */
export const getMissingDefinitions = ({
  spec,
}: {
  spec: any
}): { [key: string]: string[] } => {
  const missingDefinitions: { [definition: string]: string[] } = {}

  const dfs = (node: any, path: string[] = []) => {
    for (const key in node) {
      const newPath = [...path, key]
      if (typeof node[key] === "object" && node[key] !== null) {
        dfs(node[key], newPath)
      } else if (typeof node[key] === "string" && node[key].startsWith("#/")) {
        const defPath = node[key].substring(2).split("/")
        let defNode = spec
        for (const p of defPath) {
          defNode = defNode[p]
          if (defNode === undefined) {
            const pathString = newPath.join(".")
            if (!missingDefinitions[node[key]]) {
              missingDefinitions[node[key]] = []
            }
            missingDefinitions[node[key]].push(pathString)
            break
          }
        }
      }
    }
  }

  dfs(spec)
  return missingDefinitions
}

/**
 * Generates a modified OpenAPI specification by merging a partial specification into an
 * entry point specification.
 */
export const generateSpec = ({
  entryPointSpec,
  partialSpec,
}: {
  entryPointSpec: OpenAPIObject
  partialSpec: { [key: string]: any }
}): OpenAPIObject => {
  const missingDefinitions = getMissingDefinitions({
    spec: entryPointSpec,
  })

  for (const missingDef in missingDefinitions) {
    const defPath = missingDef.substring(2).split("/")
    const lastElement = defPath[defPath.length - 1]

    if (partialSpec[lastElement] !== undefined) {
      let currentLevel: any = entryPointSpec
      for (let i = 0; i < defPath.length - 1; i++) {
        if (!currentLevel[defPath[i]]) {
          currentLevel[defPath[i]] = {}
        }
        currentLevel = currentLevel[defPath[i]]
      }
      currentLevel[lastElement] = partialSpec[lastElement]
    }
  }

  return entryPointSpec
}

/**
 * Orchestrates everything. For each entry point spec it fills missing definitions
 * and saves the content into a new file.
 */
export const getSpecs = async ({
  sourceDir,
}: {
  sourceDir: string
}): Promise<{ spec: OpenAPIObject; fileName: string }[]> => {
  const fileNames = getFiles({ pattern: "**/*.yaml", sourceDir })

  const { entry, partial } = await importFileByTypes({
    fileNames,
    types: ["entry", "partial"],
  })

  const specs = entry.map(
    ({
      spec: entrySpec,
      fileName,
    }: {
      spec: OpenAPIObject
      fileName: string
    }) => {
      return {
        spec: partial.reduce(
          (
            acc: OpenAPIObject,
            { spec: partialSpec }: { spec: Partial<OpenAPIObject> },
          ) => {
            return generateSpec({
              entryPointSpec: acc,
              partialSpec: partialSpec,
            })
          },
          entrySpec,
        ),
        fileName,
      }
    },
  )

  return specs
}

export const main = async ({
  sourceDir = "./openapi",
  buildDir = "./build",
}: {
  sourceDir?: string
  buildDir?: string
} = {}) => {
  const specs = await getSpecs({ sourceDir })
  exportSpecsAsYaml({ specs, buildDir })
}
