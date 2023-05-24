import { describe, expect, it } from "vitest"
import fs from "fs/promises"
import yaml from "yaml"
import { generateSpec } from "./index"
import { OpenAPIObject } from "./types/openapi_spec"
import { getMissingDefinitions } from "./index"

export const importYamlContent = async ({ fileName }: { fileName: string }) => {
  const yamlContent = await fs.readFile(fileName, "utf8")
  return yaml.parse(yamlContent)
}

describe("generate spec", () => {
  it("generates spec simple", () => {
    const spec: OpenAPIObject = {
      openapi: "3.0.1",
      info: {
        title: "Your API",
        version: "1.0.0",
      },
      paths: {
        "/example": {
          post: {
            summary: "Create a new example",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/NewSchema" },
                      { $ref: "#/components/schemas/AnotherSchema" },
                    ],
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "OK",
              },
            },
          },
        },
      },
      components: {
        schemas: {
          NewSchema: {
            type: "object",
            properties: {
              email: {
                type: "string",
              },
              age: {
                type: "integer",
              },
            },
            required: ["email"],
          },
        },
      },
    }

    const partialSpec = {
      AnotherSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          address: {
            type: "string",
          },
        },
        required: ["name"],
      },
    }

    expect(
      generateSpec({ entryPointSpec: spec, partialSpec }),
    ).toMatchSnapshot()
  })

  it("generates spec complex", async () => {
    const spec = await importYamlContent({
      fileName: "openapi/connectors/bundled.yaml",
    })

    const partialSpec: OpenAPIObject = await importYamlContent({
      fileName: "openapi/connectors/index/config_properties_index.yaml",
    })

    expect(
      generateSpec({ entryPointSpec: spec, partialSpec }),
    ).toMatchSnapshot()
  })
})

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
      fileName: "openapi/connectors/bundled.yaml",
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
