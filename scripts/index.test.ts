/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { describe, expect, it } from "vitest"
import { generate } from "./index"
import bundled from "../src/connectors/bundled.json"
import { OpenAPIObject } from "./types/openapi_spec"

describe("docu generator", () => {
  it("connectors example", async () => {
    const output = await generate({
      yamlFiles: [
        "src/connectors/index/create_connector_request_index_new.yaml",
        "src/connectors/index/update_connector_request_index_new.yaml",
      ],
      specs: [bundled as unknown as OpenAPIObject],
    })

    expect(JSON.stringify(output[0], null, 2)).toMatchFileSnapshot(
      "../__snapshots/0-bundled.json"
    )
  })
})
