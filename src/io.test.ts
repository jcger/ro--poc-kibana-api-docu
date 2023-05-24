/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { expect, test, vi } from "vitest"
import { exportSpecs, importFileByTypes } from "./io"

test("import file by types", async () => {
  const output = await importFileByTypes({
    fileNames: [
      "openapi/connectors/bundled.yaml",
      "openapi/connectors/index/config_properties_index.yaml",
      "openapi/another_yaml_in_project.yaml",
    ],
  })

  expect(output).toMatchSnapshot()
})

test("exportSpecs should write specs to the build directory", async () => {
  // TODO
})
