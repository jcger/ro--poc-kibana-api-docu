import * as glob from "glob"
import redocly from "@redocly/openapi-core"
import { loadYamlFile } from "./io"
import path from "path"

interface OpenAPISpec {
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
  if (!location.pointer)
    throw new Error(`No pointer error: ${location.source.absoluteRef}`)
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
            const definitionPath = getDefinition(location)
            if (!definitionPath || !definitionPath.$ref) return

            const missingDefinition = definitionPath.$ref
              .split("/")
              .slice(-1)[0]

            console.log("missingDefinition", missingDefinition)
            // TODO: what should happen if there is more than one?
            const found = files.some((file: string) => {
              if (!file.endsWith(`${missingDefinition}.yaml`)) return false

              const relativePath = path.relative(
                path.dirname(entryPointFile),
                file,
              )
              const newRef = `./${relativePath}/${file.slice(-1)}`
              console.log(
                "Replacing",
                definitionPath,
                "with",
                newRef,
                "in",
                entryPointFile,
              )
              // replaceRef(entryYamlData, ref, newRef)
              // saveYamlFile(entryFilePath, entryYamlData)
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
