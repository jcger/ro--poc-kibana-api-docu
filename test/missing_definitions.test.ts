/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { describe, expect, it } from "vitest"
import fs from "fs/promises"
import yaml from "yaml"
import { getMissingDefinitions } from "../src/index"

export const importYamlContent = async ({ fileName }: { fileName: string }) => {
  const yamlContent = await fs.readFile(fileName, "utf8")
  return yaml.parse(yamlContent)
}

describe("missing definition", () => {
  it("finds missing definitions simple", () => {
    const spec = {
      a: {
        b: {
          c: {
            d: "#/components/schemas/existing",
          },
        },
        e: "#/components/schemas/missing",
        f: {
          g: "#/components/schemas/missing",
        },
      },
      components: {
        schemas: {
          existing: "existing",
        },
      },
    }

    expect(getMissingDefinitions({ spec })).toEqual({
      "#/components/schemas/missing": ["a.e", "a.f.g"],
    })
  })

  it("finds missing definitions complex", async () => {
    const spec = await importYamlContent({
      fileName: "test/fixtures/connectors/bundled.yaml",
    })

    expect(getMissingDefinitions({ spec })).toEqual({
      "#/components/schemas/config_properties_index": [
        "components.schemas.create_connector_request_index.properties.config.$ref",
        "components.schemas.connector_response_properties_index.properties.config.$ref",
        "components.schemas.update_connector_request_index.properties.config.$ref",
      ],
    })
  })
})
