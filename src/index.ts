import type { IncomingMessage, ServerResponse } from 'http'
import type { AuthAction, AuthOptions as BaseAuthOptions, Session } from '@auth/core'
import { AuthHandler } from '@auth/core'
import getURL from 'requrl'
import { createNodeHeaders, createNodeRequest, sendNodeResponse } from './fetch'
import { installCrypto } from './crypto'
import { installGlobals } from './globals'

installGlobals()
installCrypto()

interface AuthOptions extends BaseAuthOptions {
  /**
   * Defines the base path for the auth routes.
   * @default '/api/auth'
   */
  prefix?: string
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
  '_log',
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
export function createAuthMiddleware(options: AuthOptions) {
  const {
    prefix = '/api/auth',
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
        const response = await AuthHandler(request, authOptions)

        return await sendNodeResponse(res, response)
      }

      return next?.()
    }
    catch (error) {
      return next?.(error as any)
    }
  }
}

export async function getSession(
  req: IncomingMessage,
  options: AuthOptions,
): Promise<Session | null> {
  const { prefix = '/api/auth', ...authOptions } = options

  options.secret ??= process.env.AUTH_SECRET
  options.trustHost ??= shouldTrustHost()

  const url = new URL(`${prefix}/session`, getURL(req))
  const headers = createNodeHeaders(req.headers)

  const response = await AuthHandler(
    new Request(url as unknown as RequestInfo, { headers }),
    authOptions,
  )

  const { status = 200 } = response

  const data = await response.json()

  if (!data || !Object.keys(data).length)
    return null
  if (status === 200)
    return data
  throw new Error(data.message)
}
