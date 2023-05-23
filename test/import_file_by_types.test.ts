import { expect, it } from "vitest"
import { importFileByTypes } from "../src/file_io"

it("import file by types", async () => {
  const output = await importFileByTypes({
    fileNames: [
      "openapi/connectors/bundled.yaml",
      "openapi/connectors/index/config_properties_index.yaml",
      "openapi/another_yaml_in_project.yaml",
    ],
    types: ["entry", "partial"],
  })

  expect(output).toMatchSnapshot()
})
