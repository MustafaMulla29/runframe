import { RunFrameForCli } from "lib/components/RunFrameForCli/RunFrameForCli"
import { useEffect } from "react"
import { isFileApiAccessible } from "./utils/isFileApiAccessible.ts"

// A minimal valid STEP file for testing
const MINIMAL_STEP_FILE = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Test STEP file'),'2;1');
FILE_NAME('test.step','2024-01-01',(''),(''),'','','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;
#1=CARTESIAN_POINT('Origin',(0.,0.,0.));
ENDSEC;
END-ISO-10303-21;`

export default () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.TSCIRCUIT_REGISTRY_API_BASE_URL = `http://localhost:3100`
      window.TSCIRCUIT_REGISTRY_TOKEN = "Add-your-token-here"
    }
  }, [])

  useEffect(() => {
    setTimeout(async () => {
      await fetch("/api/events/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      // Upload a STEP model file
      await fetch("/api/files/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: "models/resistor.step",
          text_content: MINIMAL_STEP_FILE,
        }),
      })

      // Create a circuit that references the local STEP file
      await fetch("/api/files/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: "main.tsx",
          text_content: `
export default () => (
  <board width="20mm" height="15mm" thickness="1.6mm">
    <resistor
      name="R1"
      resistance="10k"
      footprint="0805"
      cadModel={{
        // This local path should be transformed to HTTP URL by export-step.ts
        stepUrl: "models/resistor.step"
      }}
    />
  </board>
)`,
        }),
      })

      await fetch("/api/files/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: "package.json",
          text_content: JSON.stringify(
            {
              name: "step-model-test",
              version: "1.0.0",
              description: "Testing STEP file export with local model URLs",
            },
            null,
            2,
          ),
        }),
      })

      await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "INITIAL_FILES_UPLOADED",
          file_count: 3,
        }),
      })
    }, 500)
  }, [])

  if (!isFileApiAccessible()) {
    return (
      <div>
        <h1>RunFrame with API - STEP File Test</h1>
        <p>
          We don't currently deploy the API to vercel, try locally! The vite
          plugin will automatically load it.
        </p>
        <h2>Test Instructions:</h2>
        <ol>
          <li>Run <code>bun run start</code> to start the dev server</li>
          <li>Navigate to this fixture in Cosmos</li>
          <li>Click the "3D" tab to render the circuit</li>
          <li>Click "Export" → "STEP (.step)"</li>
          <li>Check browser console for any fetch errors to model URLs</li>
        </ol>
      </div>
    )
  }

  return <RunFrameForCli debug />
}
