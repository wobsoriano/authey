import type { IncomingMessage, ServerResponse } from 'node:http'
import type { AuthAction, Awaitable, AuthConfig as BaseAuthConfig, Session } from '@auth/core/types'
import { Auth } from '@auth/core'
import getURL from 'requrl'
import { createNodeHeaders, createNodeRequest, sendNodeResponse } from './fetch'
import { installCrypto } from './crypto'
import { installGlobals } from './globals'

installGlobals()
installCrypto()

export interface AuthConfig extends BaseAuthConfig {
  /**
   * Defines the base path for the auth routes.
   * If you change the default value,
   * you must also update the callback URL used by the [providers](https://authjs.dev/reference/core/modules/providers).
   *
   * @default '/api/auth'
   */
  prefix?: string

  /**
   * Return a callback that can be used to modify the response before it is sent.
   * This function is called before the request is processed by Auth.js.
   * The callback is called after the request is processed by Auth.js.
   */
  conform?: (request: Request) => Awaitable<(response: Response) => Awaitable<Response>>
}

const actions: AuthAction[] = [
  'providers',
  'session',
  'csrf',
  'signin',
  'signout',
  'callback',
  'verify-request',
  'error',
]

function shouldTrustHost() {
  return !!(process.env.AUTH_TRUST_HOST ?? process.env.VERCEL ?? process.env.NODE_ENV === 'development')
}

/**
 * Create an express/connect compatible Auth.js middleware.
 *
 * @example
 *
 * ```ts
 * import express from 'express'
 * import { createAuthMiddleware } from 'authey'
 *
 * const app = express()
 * app.use(createAuthMiddleware({
 *   secret: process.env.AUTH_SECRET,
 *   trustHost: process.env.AUTH_TRUST_HOST,
 *   providers: [{}]
 * }))
 * ```
 *
 * @param options - [Auth.js](https://authjs.dev/reference/configuration/auth-config#options) options.
 */
export function createAuthMiddleware(options: AuthConfig) {
  const {
    prefix = '/api/auth',
    conform = (_: Request) => (res: Response) => res,
    ...authOptions
  } = options

  options.secret ??= process.env.AUTH_SECRET
  options.trustHost ??= shouldTrustHost()

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: (err?: Error) => void,
  ) => {
    try {
      const request = createNodeRequest(req)
      const parsedUrl = new URL(request.url)
      const [action] = parsedUrl.pathname.slice(prefix.length + 1).split('/')

      if (
        actions.includes(action as AuthAction)
        && parsedUrl.pathname.startsWith(`${prefix}/`)
      ) {
        const conformer = await conform(request)

        const response = await Auth(request, authOptions)

        return await sendNodeResponse(res, await conformer(response))
      }

      return next?.()
    }
    catch (err) {
      const error = err as Error
      return next?.(error)
    }
  }
}

export async function getSession(
  req: IncomingMessage,
  options: AuthConfig,
): Promise<Session | null> {
  const { prefix = '/api/auth', ...authOptions } = options

  options.secret ??= process.env.AUTH_SECRET
  options.trustHost ??= true

  const url = new URL(`${prefix}/session`, getURL(req))
  const request = new Request(url, { headers: createNodeHeaders(req.headers) })
  const response = await Auth(request, authOptions)

  const { status = 200 } = response
  const data = await response.json()

  if (!data || !Object.keys(data).length)
    return null
  if (status === 200)
    return data
  throw new Error(data.message)
}
