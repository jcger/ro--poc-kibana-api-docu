## Context

In our API, there are certain parameters that have not been documented. This lack of documentation is due to the absence of a straightforward method for individual teams to generate documentation specifically for their respective components without requiring knowledge of our documentation structure. As a result, these parameters remain undocumented, which may cause confusion or difficulty for developers trying to interact with the API. It is essential to establish a streamlined process that enables teams to contribute and document their components effectively, ensuring comprehensive and up-to-date API documentation for all stakeholders. By implementing a user-friendly documentation framework and providing clear guidelines, we can empower teams to document their API parameters seamlessly and improve the overall accessibility and usability of our API.

## How it works

1. It searches for all `entrypoint.yaml` files
2. For each one of them, it will follow links to files until it finds a reference to something that is no link
3. It will search for yaml files named after the previous reference
4. It will replace the reference to a relative dir to the file found in the previous step

## Installation

Clone the repo and run `npm install`

## Usage

Generate the linked documentation splitted in the `openapi` folder by running `npm run build`

## Licence

Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one or more contributor license agreements. Licensed under the Elastic License 2.0 and the Server Side Public License, v 1; you may not use this file except in compliance with, at your election, the Elastic License 2.0 or the Server Side Public License, v 1.
