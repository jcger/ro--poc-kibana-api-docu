/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PathsObject } from './types/openapi_spec';

export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

export const getOperationIds = ({ paths }: { paths: PathsObject }) => {
  const operationIds = new Set<string>();

  for (const path in paths) {
    if (!paths.hasOwnProperty(path)) {
      continue;
    }
    for (const method in paths[path]) {
      if (!paths[path].hasOwnProperty(method)) {
        continue;
      }
      const operationId = paths[path][method].operationId;
      if (operationId !== undefined) {
        operationIds.add(operationId);
      }
    }
  }
  return operationIds;
};

export const getFilesByOperationId = ({
  operationId,
  yamlFiles,
}: {
  operationId: string;
  yamlFiles: string[];
}): string[] => {
  // operationIds are camelCase in the spec definition, but Kibana's file names must be in snake_case
  const formattedOperationId = camelToSnakeCase(operationId);
  const files = yamlFiles.filter((file) =>
    file.split('/').slice(-1)[0].startsWith(formattedOperationId)
  );
  return files;
};

export const getSpecDefinitionFiles = ({
  paths,
  yamlFiles,
}: {
  paths: PathsObject;
  yamlFiles: string[];
}) => {
  const operationIds = getOperationIds({ paths });
  const files = Array.from(operationIds.values())
    .map((operationId) => getFilesByOperationId({ operationId, yamlFiles }))
    .flat();
  return files;
};
