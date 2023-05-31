import * as glob from "glob"
import redocly from "@redocly/openapi-core"
import { loadYamlFile } from "./io"

function getValueFromPath(obj: { [key in string]: any }, path: string) {
  if (path.startsWith("#/")) {
    path = path.substring(2)
  }
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

const main = async ({ sourceDir = "./openapi" }: { sourceDir: string }) => {
  const fileNames = glob.glob.sync(`${sourceDir}/**/*.yaml`, {
    root: sourceDir || process.cwd(),
  })
  fileNames.forEach((file: string) => {
    if (!file.endsWith("entrypoint.yaml")) return

    redocly
      .bundle({
        ref: file,
        config: new redocly.Config({}),
        dereference: false,
      })
      .then((bundle) => {
        bundle.problems.forEach((problem) => {
          problem.location.forEach((location) => {
            // TODO: check that the error type is missing $ref
            const missingDefinition = getDefinition(location)
              .$ref.split("/")
              .slice(-1)[0]

            fileNames.forEach((file: string) => {
              if (!file.endsWith(`${missingDefinition}.yaml`)) return

              console.log("found missing definition file", file)
            })
          })
        })
      })
  })
}

main({ sourceDir: "./openapi" })
