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
import {
  DocLinkerTypes,
  Spec,
  SpecsByType,
  specFactoryByDocument,
} from "./spec"

const DOC_LINKER_TYPES: DocLinkerTypes[] = ["entry", "partial"]

const parseYamlFile = async ({ fileName }: { fileName: string }) => {
  const yamlContent = await fs.readFile(fileName, "utf8")
  return yaml.parseDocument(yamlContent)
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

type ImportFileByTypesParams = {
  fileNames: string[]
}
export const importFileByTypes = async ({
  fileNames,
}: ImportFileByTypesParams): Promise<SpecsByType> => {
  const yamlContents = await Promise.all(
    fileNames.map((fileName: string) => parseYamlFile({ fileName })),
  )

  return fileNames.reduce(
    (acc: SpecsByType, fileName: string, index: number) => {
      const doc = yamlContents[index]

      if (!doc.commentBefore?.includes("@kbn-doc-linker")) return acc

      DOC_LINKER_TYPES.forEach((type: DocLinkerTypes) => {
        if (doc.commentBefore?.includes(type)) {
          console.log(JSON.stringify(doc, null, 2))
          acc[type].push(specFactoryByDocument({ doc, fileName }))
        }
      })

      return acc
    },
    { entry: [], partial: [] } as SpecsByType,
  )
}

export const exportSpecs = async ({
  specs,
  buildDir = "./build",
}: {
  specs: Spec[]
  buildDir: string
}) => {
  specs.forEach(async (spec: Spec) => {
    const buildPath = `${buildDir}/${spec.fileName}`

    const buildFolderPath = buildPath.substring(0, buildPath.lastIndexOf("/"))
    await fs.ensureDir(buildFolderPath)
    await fs.writeFile(buildPath, spec.yaml)
  })
}
