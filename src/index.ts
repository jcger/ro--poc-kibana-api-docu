/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
export const getMissingDefinitions = ({
  spec,
}: {
  spec: any
}): { [key: string]: string[] } => {
  const missingDefinitions: { [definition: string]: string[] } = {}

  const dfs = (node: any, path: string[] = []) => {
    for (const key in node) {
      const newPath = [...path, key]
      if (typeof node[key] === "object" && node[key] !== null) {
        dfs(node[key], newPath)
      } else if (typeof node[key] === "string" && node[key].startsWith("#/")) {
        const defPath = node[key].substring(2).split("/")
        let defNode = spec
        for (const p of defPath) {
          defNode = defNode[p]
          if (defNode === undefined) {
            const pathString = newPath.join(".")
            if (!missingDefinitions[node[key]]) {
              missingDefinitions[node[key]] = []
            }
            missingDefinitions[node[key]].push(pathString)
            break
          }
        }
      }
    }
  }

  dfs(spec)
  return missingDefinitions
}

export const generateSpec = <T extends { [key: string]: any }>({
  entryPointSpec,
  partialSpec,
}: {
  entryPointSpec: T
  partialSpec: Partial<T>
}) => {
  const missingDefinitions = getMissingDefinitions({
    spec: entryPointSpec,
  })

  for (const missingDef in missingDefinitions) {
    const defPath = missingDef.substring(2).split("/")
    const lastElement = defPath[defPath.length - 1]

    if (partialSpec[lastElement] !== undefined) {
      let currentLevel: any = entryPointSpec
      for (let i = 0; i < defPath.length - 1; i++) {
        if (!currentLevel[defPath[i]]) {
          currentLevel[defPath[i]] = {}
        }
        currentLevel = currentLevel[defPath[i]]
      }
      currentLevel[lastElement] = partialSpec[lastElement]
    }
  }

  return entryPointSpec
}
