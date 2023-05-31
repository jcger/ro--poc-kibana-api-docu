/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as fs from "fs-extra"
import * as yaml from "yaml"
import { OpenAPISpec } from "."

export function loadYamlFile(filePath: string): OpenAPISpec {
  const fileContent = fs.readFileSync(filePath, "utf8")
  return yaml.parseDocument(fileContent).toJSON() as OpenAPISpec
}

export function saveYamlFile(filePath: string, data: OpenAPISpec): void {
  fs.writeFileSync(filePath, String(new yaml.Document(data)), "utf8")
}
