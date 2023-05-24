/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as yaml from "yaml"
import { OpenAPIObject } from "./types/openapi_spec"

export type DocLinkerTypes = "entry" | "partial"

export type Spec = {
  doc: yaml.Document<yaml.Node>
  openApi: OpenAPIObject
  yaml: string
  fileName: string
}

export type SpecsByType = {
  [type in DocLinkerTypes]: Spec[]
}

type SpecFactoryParams = {
  doc: yaml.Document<yaml.Node>
  fileName: string
}
export const specFactory = ({ doc, fileName }: SpecFactoryParams): Spec => {
  return {
    doc,
    openApi: doc.toJSON() as OpenAPIObject,
    yaml: String(doc),
    fileName,
  }
}

export const openApi2yamlDoc = (
  openApi: OpenAPIObject,
): yaml.Document<yaml.Node> => {
  return new yaml.Document(openApi)
}
