import * as yaml from "yaml"
import { OpenAPIObject } from "./types/openapi_spec"

export type DocLinkerTypes = "entry" | "partial"

export type Spec = {
  doc?: yaml.Document<yaml.Node>
  openApi: OpenAPIObject
  yaml: string
  fileName: string
}

export type SpecsByType = {
  [type in DocLinkerTypes]: Spec[]
}

type SpecFactoryParamsByDocument = {
  doc: yaml.Document<yaml.Node>
  fileName: string
}
export const specFactoryByDocument = ({
  doc,
  fileName,
}: SpecFactoryParamsByDocument): Spec => {
  return {
    doc,
    openApi: doc.toJSON() as OpenAPIObject,
    yaml: String(doc),
    fileName,
  }
}

export const openApi2yamlDoc = (
  openApi: OpenAPIObject,
): yaml.Document<yaml.Node> => {
  return new yaml.Document(openApi)
}
