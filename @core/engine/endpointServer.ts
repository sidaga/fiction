/** server-only-file */
import http from "http"
import express from "express"

import { ErrorConfig, EndpointResponse } from "@factor/types"
import { logger, _stop, decodeClientToken, onEvent } from "@factor/api"
import { Endpoint } from "./endpoint"
import { Queries } from "./user"
import { Query } from "./query"
import { createExpressApp } from "./nodeUtils"

type CustomServerHandler = (
  app: express.Express,
) => Promise<http.Server> | http.Server

type MiddlewareHandler = (app: express.Express) => Promise<void> | void

export type EndpointServerOptions = {
  port: string
  name: string
  endpoints: Endpoint<Query>[]
  customServer?: CustomServerHandler
  middleware?: MiddlewareHandler
}

export class EndpointServer {
  name: string
  port: string
  endpoints: Endpoint<Query>[]
  customServer?: CustomServerHandler
  middleware?: MiddlewareHandler

  constructor(options: EndpointServerOptions) {
    const { port, endpoints, customServer } = options
    this.name = options.name
    this.port = port
    this.endpoints = endpoints
    this.customServer = customServer
  }

  async serverCreate(): Promise<http.Server | undefined> {
    try {
      const app = createExpressApp()

      this.endpoints.forEach((endpoint) => {
        const { basePath, key } = endpoint

        app.use(`${basePath}/${key}`, this.endpointAuthorization)
        console.log("CREATE EP", `${basePath}/${key}`)
        app.use(`${basePath}/${key}`, async (request, response) => {
          const result = await endpoint.serveRequest(request)
          delete result.internal
          response.status(200).send(result).end()
        })
      })

      app.use("/health", (request, response) => {
        response.status(200).send({ status: "success", message: "ok" }).end()
      })

      if (this.middleware) {
        await this.middleware(app)
      }

      const server: http.Server = await new Promise(async (resolve) => {
        let s: http.Server
        if (this.customServer) {
          s = await this.customServer(app)
          s.listen(this.port, () => resolve(s))
        } else {
          s = app.listen(this.port, () => resolve(s))
        }
      })

      logger.log({
        level: "info",
        context: "serverCreate",
        description: `endpoint server`,
        data: { name: this.name, port: this.port },
      })

      onEvent("shutdown", () => {
        server.close()
      })

      return server
    } catch (error) {
      logger.log({
        level: "error",
        context: "serverCreate",
        description: "server create err",
        error,
      })
    }
  }
  /**
   * Takes authorization header with bearer token and converts it into a user for subsequent endpoint operations
   * @param bearerToken - JWT token sent from client in authorization header
   *
   * @category server
   */
  setAuthorizedUser = async (
    request: express.Request,
  ): Promise<express.Request> => {
    const bearerToken = request.headers.authorization

    if (bearerToken && bearerToken.startsWith("Bearer ")) {
      const token = bearerToken.split("Bearer ")[1]
      request.bearerToken = token

      if (request.bearerToken) {
        const { email } = decodeClientToken(request.bearerToken)

        const { data: user } = await Queries.ManageUser.serve(
          {
            email,
            _action: "getPrivate",
          },
          undefined,
        )

        if (user) {
          request.bearer = user
          request.bearerToken = token
        } else {
          request.bearer = undefined
        }
      }
    }

    return request
  }

  endpointAuthorization = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ): Promise<void> => {
    if (request.path === "/favicon.ico") return

    const {
      headers: { authorization },
    } = request

    try {
      request = await this.setAuthorizedUser(request)
      next()
    } catch (error) {
      logger.log({
        level: "error",
        context: "endpoint",
        description: `endpoint setup error (${authorization ?? ""})`,
        data: error,
      })

      response
        .status(200)
        .send({
          status: "error",
          message: "authorization error",
          code: "TOKEN_ERROR",
        })
        .end()
    }
  }

  endpointErrorResponse = (
    error: ErrorConfig,
    request: express.Request,
  ): EndpointResponse => {
    const details = request.body as Record<string, any>
    logger.log({
      level: "error",
      context: "endpointErrorResponse",
      description: `error: ${request.url}`,
      data: { error, ...details },
    })

    return {
      status: "error",
      message: error.expose ? error.message : "",
      code: error.code,
      expose: error.expose,
    }
  }
}
