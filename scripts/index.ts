/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import path from "path"
import { mergeSpecs } from "./merge_specs"
import { getSpecDefinitionFiles } from "./search_spec_files"
import { OpenAPIObject } from "./types/openapi_spec"
import {
  getYamlFiles,
  importJSONSpecFile,
  importYamlSpecFile,
  exportJsonSpecFile,
} from "./file_io"

const BUNDLED_PATH = "src/common" // x-pack/plugins/actions/docs/openapi

if (process.env.PWD === undefined) {
  throw new Error("PWD environment variable is not defined")
}

const PLUGIN_BUNDLES: string[] = [
  path.join(process.env.PWD, `${BUNDLED_PATH}/bundled.json`),
]

export const generate = async ({
  yamlFiles,
  specs,
}: {
  yamlFiles: string[]
  specs: OpenAPIObject[]
}): Promise<OpenAPIObject[]> => {
  return await Promise.all(
    specs.map(async (spec: OpenAPIObject) => {
      const partialSpecFileUris = getSpecDefinitionFiles({
        paths: spec.paths,
        yamlFiles,
      })
      const partialSpecs = await Promise.all(
        partialSpecFileUris.map((uri: string) =>
          importYamlSpecFile({ fileName: uri })
        )
      )
      return partialSpecs.reduce(
        (acc: OpenAPIObject, partialSpec: Partial<OpenAPIObject>) => {
          return mergeSpecs({ spec: acc, partialSpec })
        },
        spec
      )
    })
  )
}

const main = async () => {
  const bundledSpecs = await Promise.all(
    PLUGIN_BUNDLES.map((fileUri: string) =>
      importJSONSpecFile({ fileName: fileUri })
    )
  )

  const outputSpecs = await generate({
    yamlFiles: getYamlFiles(),
    specs: bundledSpecs,
  })

  outputSpecs.forEach((output: OpenAPIObject, idx) => {
    exportJsonSpecFile({
      fileName: `build/${idx}-bundled.json`,
      content: JSON.stringify(output, null, 2),
    })
  })
}

if (process.env.NODE_ENV !== "test") {
  main()
}
