/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// Suport for Specification Extensions
// as described in
// https://github.com/OAI/OpenAPI-Specification/blob/3.0.0-rc0/versions/3.0.md#specificationExtensions

//  Specification Extensions
//   ^x-
export type IExtensionName = `x-${string}`;
export type IExtensionType = any;
export interface ISpecificationExtension {
  [extensionName: IExtensionName]: IExtensionType;
}

export class SpecificationExtension implements ISpecificationExtension {
  [extensionName: IExtensionName]: any;

  static isValidExtension(extensionName: string): boolean {
    return /^x-/.test(extensionName);
  }

  getExtension(extensionName: string): any {
    if (!SpecificationExtension.isValidExtension(extensionName)) {
      throw new Error(
        `Invalid specification extension: '${extensionName}'. Extensions must start with prefix 'x-`
      );
    }
    if (this[extensionName]) {
      return this[extensionName];
    }
    return null;
  }
  addExtension(extensionName: string, payload: any): void {
    if (!SpecificationExtension.isValidExtension(extensionName)) {
      throw new Error(
        `Invalid specification extension: '${extensionName}'. Extensions must start with prefix 'x-`
      );
    }
    this[extensionName] = payload;
  }
  listExtensions(): string[] {
    const res: string[] = [];
    for (const propName in this) {
      if (Object.prototype.hasOwnProperty.call(this, propName)) {
        if (SpecificationExtension.isValidExtension(propName)) {
          res.push(propName);
        }
      }
    }
    return res;
  }
}
