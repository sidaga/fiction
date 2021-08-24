import { distClient, distFolder, nLog } from "@factor/server"

import compression from "compression"
import express from "express"
import fs from "fs-extra"
import path from "path"
import serveStatic from "serve-static"

import { getRequestHtml, htmlGenerators } from "./render"
import { getSitemapPaths } from "./sitemap"
const staticDir = (): string => path.join(distFolder(), "static")

export const preRenderPages = async (): Promise<void> => {
  const generators = await htmlGenerators("production")

  const urls = await getSitemapPaths()

  fs.ensureDirSync(staticDir())
  fs.emptyDirSync(staticDir())
  fs.copySync(distClient(), staticDir())

  /**
   * @important pre-render in series
   * if pre-rendering isn't in series than parallel builds can interfere with one-another
   */
  const _asyncFunctions = urls.map((url: string) => {
    return async (): Promise<string> => {
      const html = await getRequestHtml({ ...generators, url })

      const filePath = `${url === "/" ? "/index" : url}.html`
      const writePath = path.join(staticDir(), filePath)
      fs.ensureDirSync(path.dirname(writePath))
      fs.writeFileSync(writePath, html)
      nLog("info", `pre-rendered: ${filePath}`)
      return filePath
    }
  })
  // run in series
  for (const fn of _asyncFunctions) {
    await fn()
  }

  return
}

export const serveStaticApp = async (): Promise<void> => {
  const app = express()

  app.use(compression())
  app.use((req, res, next) => {
    if (!req.path.includes(".")) {
      req.url = `${req.url.replace(/\/$/, "")}.html`
    }
    nLog("info", `request at ${req.url}`)
    next()
  })
  app.use(serveStatic(staticDir(), { extensions: ["html"] }))

  app.use("*", (req, res) => {
    nLog("info", `serving fallback at ${req.baseUrl}`)
    res.sendFile(path.join(staticDir(), "/index.html"))
  })
  const port = process.env.PORT || 3000
  await app.listen(port)
  nLog(`success`, `static@http://localhost:${port}`)
}

export const preRender = async (
  options: { serve?: boolean } = {},
): Promise<void> => {
  const { serve } = options
  await preRenderPages()

  if (serve) {
    await serveStaticApp()
  }
}
