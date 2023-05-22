import { describe, expect, it } from "vitest"
import { generateSpec } from "../src/index"
import { importFile } from "../src/file_io"
import { OpenAPIObject } from "../src/types/openapi_spec"

describe("generate spec", () => {
  it("generates spec simple", () => {
    const spec: { [key in string]: any } = {
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

    const partialSpec = {
      missing: {
        value: "not missing anymore",
      },
    }

    expect(generateSpec({ entryPointSpec: spec, partialSpec }))
      .toMatchInlineSnapshot(`
      {
        "a": {
          "b": {
            "c": {
              "d": "#/components/schemas/existing",
            },
          },
          "e": "#/components/schemas/missing",
          "f": {
            "g": "#/components/schemas/missing",
          },
        },
        "components": {
          "schemas": {
            "existing": "existing",
            "missing": {
              "value": "not missing anymore",
            },
          },
        },
      }
    `)
  })

  it("generates spec complex", async () => {
    const spec: OpenAPIObject = await importFile({
      fileName: "test/fixtures/connectors/docs_entry_bundled.yaml",
    })

    const partialSpec: Partial<OpenAPIObject> = await importFile({
      fileName:
        "test/fixtures/connectors/index/docs_partial_config_properties_index.yaml",
    })

    expect(
      generateSpec({ entryPointSpec: spec, partialSpec })
    ).toMatchSnapshot()
  })
})
