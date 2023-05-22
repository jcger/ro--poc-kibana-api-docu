import { describe, expect, it } from "vitest"
import { importFileByTypes } from "../src/file_io"

it("import file by types", async () => {
  const output = await importFileByTypes({
    fileNames: [
      "test/fixtures/connectors/bundled.yaml",
      "test/fixtures/connectors/index/config_properties_index.yaml",
      "test/fixtures/another_yaml_in_project.yaml",
    ],
    types: ["entry", "partial"],
  })

  expect(output).toMatchSnapshot()
})
