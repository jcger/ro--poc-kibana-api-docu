import * as glob from "glob"
import * as yaml from "yaml"
import * as fs from "fs-extra"
import redocly from "@redocly/openapi-core"
import { loadYamlFile } from "./io"
import path from "path"

export interface OpenAPISpec {
  $ref?: string
  [key: string]: any
}

function getValueFromPath(obj: OpenAPISpec, path: string) {
  if (path.startsWith("#/")) {
    path = path.substring(2)
  }
  // redocly uses ~1 for / in paths, for example application/json is valid
  const paths = path.split("/").map((p: string) => p.replace("~1", "/"))
  let current = obj

  for (let i = 0; i < paths.length; i++) {
    if (current[paths[i]] === undefined) {
      return undefined
    } else {
      current = current[paths[i]]
    }
  }

  return current
}

const getDefinition = (location: redocly.LocationObject) => {
  const spec = loadYamlFile(location.source.absoluteRef)
  return getValueFromPath(spec, location.pointer)
}

function replaceRef(obj: OpenAPISpec, oldRef: string, newRef: string): void {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      replaceRef(obj[key], oldRef, newRef)
    } else if (key === "$ref" && obj[key] === oldRef) {
      obj[key] = newRef
    }
  }
}

const main = async ({ sourceDir = "./openapi" }: { sourceDir: string }) => {
  const files = glob.glob.sync(`${sourceDir}/**/*.yaml`, {
    root: sourceDir || process.cwd(),
  })

  files.forEach((entryPointFile: string) => {
    if (!entryPointFile.endsWith("entrypoint.yaml")) return

    redocly
      .bundle({
        ref: entryPointFile,
        config: new redocly.Config({}),
        dereference: false,
      })
      .then((bundle) => {
        bundle.problems.forEach((problem) => {
          if (problem.message !== "Can't resolve $ref") return

          problem.location.forEach((location) => {
            if (!location.pointer) return

            const definitionPath = getDefinition(location)
            if (!definitionPath || !definitionPath.$ref) return

            const missingDefinition = definitionPath.$ref
              .split("/")
              .slice(-1)[0]

            const found = files.some((file: string) => {
              if (!file.endsWith(`${missingDefinition}.yaml`)) return false

              const relativePath = path.relative(
                path.dirname(location.source.absoluteRef),
                file,
              )

              // TODO: Open "absoluteRef" file, go to the "pointer" position and replace the $ref to be "relativePath"
              const spec = loadYamlFile(location.source.absoluteRef)
              const definition = getValueFromPath(spec, location.pointer)
              if (definition && definition.$ref) {
                replaceRef(spec, definition.$ref, relativePath)

                const yamlContent = String(new yaml.Document(spec))
                fs.writeFileSync(
                  location.source.absoluteRef,
                  yamlContent,
                  "utf8",
                )
              }

              return true
            })

            if (!found) {
              console.error("Unknown error, run @readcly/cli for details")
              process.exit(1)
            }
          })
        })
      })
  })
}

main({ sourceDir: "./openapi" })
