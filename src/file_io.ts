/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from "fs/promises"
import * as glob from "glob"
import * as yaml from "yaml"

export const importFile = async ({ fileName }: { fileName: string }) => {
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
    fileNames.map((fileName) => importFile({ fileName })),
  )

  const parsedYaml = yamlContent.reduce(
    (
      acc: { [key in string]: string[] },
      doc: yaml.Document.Parsed<yaml.ParsedNode>,
    ) => {
      if (!doc.commentBefore?.includes("@kbn-doc-linker")) return acc

      types.forEach((type) => {
        if (!acc[type]) acc[type] = []

        if (doc.commentBefore?.includes(type)) {
          acc[type].push(String(doc))
          return acc
        }
      })
    },
    {},
  )

  return parsedYaml
}

export const getFiles = ({ pattern }: { pattern: string }) => {
  return glob.glob.sync(pattern, {
    root: process.cwd(),
  })
}

export const exportFile = async ({
  fileName,
  content,
}: {
  fileName: string
  content: string
}) => {
  try {
    await fs.writeFile(fileName, content)
  } catch (err) {
    console.log(err)
  }
}
