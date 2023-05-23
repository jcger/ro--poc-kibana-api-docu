/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as fs from "fs-extra"
import * as glob from "glob"
import * as yaml from "yaml"
import { OpenAPIObject } from "./types/openapi_spec"

const parseYamlFile = async ({ fileName }: { fileName: string }) => {
  const yamlContent = await fs.readFile(fileName, "utf8")
  return yaml.parseDocument(yamlContent)
}

export const importFileByTypes = async ({
  fileNames,
  types,
}: {
  fileNames: string[]
  types: string[]
}) => {
  const yamlContent = await Promise.all(
    fileNames.map(async (fileName) => {
      return {
        doc: await parseYamlFile({ fileName }),
        fileName,
      }
    }),
  )

  const parsedYaml = yamlContent
    .filter(({ doc }) => doc.commentBefore?.includes("@kbn-doc-linker"))
    .reduce(
      (
        acc: any,
        {
          doc,
          fileName,
        }: { doc: yaml.Document.Parsed<yaml.ParsedNode>; fileName: string },
      ) => {
        types.forEach((type) => {
          if (doc.commentBefore?.includes(type)) {
            if (!acc[type]) acc[type] = []
            acc[type].push({
              spec: doc.toJSON(),
              fileName,
            })
          }
        })
        return acc
      },
      {},
    )

  return parsedYaml
}

export const getFiles = ({
  pattern,
  sourceDir,
}: {
  pattern: string
  sourceDir: string
}) => {
  return glob.glob.sync(pattern, {
    root: sourceDir || process.cwd(),
  })
}

export const exportSpecsAsYaml = async ({
  specs,
  buildDir = "./build",
}: {
  specs: { spec: OpenAPIObject; fileName: string }[]
  buildDir: string
}) => {
  specs.forEach(
    async ({ spec, fileName }: { spec: OpenAPIObject; fileName: string }) => {
      const doc = yaml.parseDocument(JSON.stringify(spec))
      const buildPath = `${buildDir}/${fileName}`

      const buildFolderPath = buildPath.substring(0, buildPath.lastIndexOf("/"))
      await fs.ensureDir(buildFolderPath)
      await fs.writeFile(buildPath, doc.toString())
    },
  )
}
