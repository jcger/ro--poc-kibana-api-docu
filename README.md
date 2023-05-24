## Issue

Documentation is centralized

## How it works

1. This tool searches for yaml files that contain `@kbn-doc-linker entry` (entry files) and `@kbn-doc-linker partial` (partial files) as header comment
2. It searches for missing definitions in the yaml files marked as entry file
3. It searches for those missing definitions in the yaml files marked as partial file
4. It adds those missing definitions to the entry file and creates a new file

Example `openapi/demo` folder:

The entry file is called `example.yaml`, the first line indicates that it is an entry file:

```yaml
# @kbn-doc-linker entry

openapi: 3.0.1
info:
  title: Your API
  version: 1.0.0
  license:
    name: "MIT"
    url: "fakeurl"
servers:
  - url: http://localhost:5601
    description: local
paths:
  /example:
    post:
      operationId: createExample
      summary: Create a new example
      requestBody:
        required: true
        content:
          application/json:
            schema:
              oneOf:
                - $ref: "#/components/schemas/NewSchema"
                - $ref: "#/components/schemas/AnotherSchema" # this definition is missing in this file
      responses:
        "200":
          description: OK
        "400":
          description: KO
components:
  securitySchemes:
    basicAuth:
      type: http
      scheme: basic
  schemas:
    NewSchema:
      type: object
      properties:
        email:
          type: string
        age:
          type: integer
      required:
        - email
security:
  - basicAuth: []
```

And we have an `another_schema.yaml` file that looks like this:

```yaml
# @kbn-doc-linker partial

AnotherSchema: # this is the definition missing in the entry file
  type: object
  properties:
    name:
      type: string
    address:
      type: string
  required:
    - name
```

The first line indicates that it is a partial spec definition. When running this tool, the output will be

```yaml
openapi: 3.0.1
info:
  title: Your API
  version: 1.0.0
  license:
    name: MIT
    url: fakeurl
servers:
  - url: http://localhost:5601
    description: local
paths:
  /example:
    post:
      operationId: createExample
      summary: Create a new example
      requestBody:
        required: true
        content:
          application/json:
            schema:
              oneOf:
                - $ref: "#/components/schemas/NewSchema"
                - $ref: "#/components/schemas/AnotherSchema"
      responses:
        "200":
          description: OK
        "400":
          description: KO
components:
  securitySchemes:
    basicAuth:
      type: http
      scheme: basic
  schemas:
    NewSchema:
      type: object
      properties:
        email:
          type: string
        age:
          type: integer
      required:
        - email
    AnotherSchema:
      type: object
      properties:
        name:
          type: string
        address:
          type: string
      required:
        - name
security:
  - basicAuth: []
```

## Installation

Clone the repo and run `npm install`

## Usage

Generate the linked documentation splitted in the `openapi` folder by running `npm run build`

This will create a folder called `build` with the same file/folder tree as the `openapi` folder but will join the entry point yaml spec definitions with its missing parts.

## Licence

Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one or more contributor license agreements. Licensed under the Elastic License 2.0 and the Server Side Public License, v 1; you may not use this file except in compliance with, at your election, the Elastic License 2.0 or the Server Side Public License, v 1.
