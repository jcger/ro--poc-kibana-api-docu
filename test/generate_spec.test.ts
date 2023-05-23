import { describe, expect, it } from "vitest"
import fs from "fs/promises"
import yaml from "yaml"
import { generateSpec } from "../src/index"
import { OpenAPIObject } from "../src/types/openapi_spec"

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
