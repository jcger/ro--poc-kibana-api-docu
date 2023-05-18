import { generateSpec, getMissingDefinitions } from "../scripts/index"

describe("generate spec", () => {
  it("connectors example", async () => {
    const generatedSpec = await generateSpec({
      rootDir: "src/connectors",
    })

    expect(JSON.stringify(generatedSpec, null, 2)).toMatchSnapshot(
      "./__snapshots__/output-0.json",
    )
  })
})
