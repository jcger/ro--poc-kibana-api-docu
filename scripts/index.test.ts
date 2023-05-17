/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { describe, expect, it } from "vitest"
import { generate } from "./index"
import bundled from "../test_data/common/bundled.json"
import { OpenAPIObject } from "./types/openapi_spec"

describe("docu generator", () => {
  it("snapshot", async () => {
    const output = await generate({
      yamlFiles: [
        "test_data/particular/index/create_connector_request_index_new.yaml",
      ],
      specs: [bundled as unknown as OpenAPIObject],
    })

    expect(JSON.stringify(output[0], null, 2)).toMatchFileSnapshot(
      "../test_data/assertion/0-bundled.json"
    )
  })
})
