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
    fileNames.map((fileName) => parseYamlFile({ fileName })),
  )

  const filteredYamlContent = yamlContent.filter((doc) =>
    doc.commentBefore?.includes("@kbn-doc-linker"),
  )

  const parsedYaml = filteredYamlContent.reduce(
    (acc: any, doc: yaml.Document.Parsed<yaml.ParsedNode>) => {
      types.forEach((type) => {
        if (doc.commentBefore?.includes(type)) {
          if (!acc[type]) acc[type] = []
          acc[type].push(doc.toJSON())
        }
      })
      return acc
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
