/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from "fs/promises"
import * as glob from "glob"
import * as yaml from "js-yaml"

export const importYamlFile = async <T>({
  fileName,
}: {
  fileName: string
}): Promise<T> => {
  const yamlContent = await fs.readFile(fileName, "utf8")
  return yaml.load(yamlContent) as T
}

export const getFiles = ({ pattern }: { pattern: string }) => {
  return glob.glob.sync(pattern, {
    root: process.cwd(),
  })
}

export const exportJsonFile = async ({
  fileName,
  content,
}: {
  fileName: string
  content: string
}) => {
  try {
    await fs.writeFile(fileName, content)
  } catch (err) {
    console.log(err)
  }
}