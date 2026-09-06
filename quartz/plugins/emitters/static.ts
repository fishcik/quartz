import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname } from "path"

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  async *emit({ argv, cfg }) {
    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    const outputStaticPath = joinSegments(argv.output, "static")
    await fs.promises.mkdir(outputStaticPath, { recursive: true })
    for (const fp of fps) {
      const src = joinSegments(staticPath, fp) as FilePath
      const dest = joinSegments(outputStaticPath, fp) as FilePath
      await fs.promises.mkdir(dirname(dest), { recursive: true })
      await fs.promises.copyFile(src, dest)
      yield dest
    }

    // Mirror quartz/static/terminal directly to public/terminal for clean URL sayko.ch/terminal
    const terminalSrc = joinSegments(staticPath, "terminal")
    if (fs.existsSync(terminalSrc)) {
      const termFps = await glob("**", terminalSrc, cfg.configuration.ignorePatterns)
      const outputTermPath = joinSegments(argv.output, "terminal")
      await fs.promises.mkdir(outputTermPath, { recursive: true })
      for (const fp of termFps) {
        const src = joinSegments(terminalSrc, fp) as FilePath
        const dest = joinSegments(outputTermPath, fp) as FilePath
        await fs.promises.mkdir(dirname(dest), { recursive: true })
        await fs.promises.copyFile(src, dest)
        yield dest
      }
    }
  },
  async *partialEmit() {},
})
