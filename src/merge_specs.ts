/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import mergeWith from "lodash/mergeWith"
import { OpenAPIObject } from "./types/openapi_spec"

/**
 * lodash/merge doesnt concat arrays so we need to do it manually
 * using lodash/mergeWith
 */
function mergeCustomizer(objValue: string[], srcValue: string[]) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

export const mergeSpecs = ({
  spec,
  partialSpec,
}: {
  spec: OpenAPIObject
  partialSpec: Partial<OpenAPIObject>
}): OpenAPIObject => {
  return mergeWith(spec, partialSpec, mergeCustomizer)
}
