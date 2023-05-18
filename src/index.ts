/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import path from "path"
import { mergeSpecs } from "./merge_specs"
import { OpenAPIObject } from "./types/openapi_spec"
import { getFiles, importYamlFile, exportJsonFile } from "./file_io"
import { DocLinkerOpenAPIObject } from "./types/doc_linker"

if (process.env.PWD === undefined) {
  throw new Error("PWD environment variable is not defined")
}

// const generateEntryPointSpec = async ({
//   partialSpecFileNames,
//   entryPointFileName,
// }: {
//   partialSpecFileNames: string[]
//   entryPointFileName: string
// }): Promise<OpenAPIObject> => {
//   // loads the entry point file content
//   const entryPointSpec = await importYamlFile<DocLinkerOpenAPIObject>({
//     fileName: entryPointFileName,
//   })

//   // gets the doc linker id and removes it from the spec
//   const docLinkerId = entryPointSpec.docLinkerId
//   const spec = Object.assign({}, entryPointSpec, { docLinkerId: undefined })

//   // gets array of yaml files that are linked to the entry point spec
//   const linkedFileNames = partialSpecFileNames.filter(
//     (file: string) =>
//       file.split("/").slice(-1)[0].split("_")[0] === docLinkerId,
//   )

//   // load all contents
//   const linkedSpecs = await Promise.all(
//     linkedFileNames.map((uri: string) => {
//       return importYamlSpecFile<Partial<OpenAPIObject>>({ fileName: uri })
//     }),
//   )

//   // merges all the specs into one
//   const output = linkedSpecs.reduce(
//     (acc: OpenAPIObject, partialSpec: Partial<OpenAPIObject>) => {
//       return mergeSpecs({ spec: acc, partialSpec })
//     },
//     spec,
//   )

//   return output
// }

// export const generate = async ({
//   entryPointFileName,
//   partialSpecFileNames,
// }: {
//   entryPointFileName: string
//   partialSpecFileNames: string
// }) => {
//   const generatedSpec = await generateEntryPointSpec({
//     partialSpecFileNames: getFiles({ pattern: partialSpecFileNames }),
//     entryPointFileName,
//   })

//   exportJsonFile({
//     fileName: `build/bundled.json`,
//     content: JSON.stringify(generatedSpec, null, 2),
//   })
// }

const PARTIAL_KEY = "docs_partial_"
const ENTRY_POINT_KEY = "docs_entry_"
const PARTIAL_FILES_PATTERN = `**/${PARTIAL_KEY}*.yaml`
const ENTRY_POINT_FILES_PATTERN = `**/${ENTRY_POINT_KEY}*.yaml`

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

export const generateSpec = async ({ rootDir }: { rootDir: string }) => {
  const partialSpecFileNames = getFiles({ pattern: PARTIAL_FILES_PATTERN })
  const entryPointFileNames = getFiles({ pattern: ENTRY_POINT_FILES_PATTERN })

  // for each entry point file
  return Promise.all(
    entryPointFileNames.map(async (entryPointFileName) => {
      // search for missing definitions
      // for each missing definition
      // search for definition in partial file name ignoring prefix
      // if found, merge using the path of the definition
    }),
  )
}
