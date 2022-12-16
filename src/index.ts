import type { IncomingMessage, ServerResponse } from 'http'
import type { AuthAction, AuthOptions as BaseAuthOptions, Session } from '@auth/core'
import { AuthHandler } from '@auth/core'
import getURL from 'requrl'
import { createNodeRequest, sendNodeResponse } from './request'
import installCrypto from './crypto'
import { installGlobals } from './globals'

installCrypto()
installGlobals()

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

export function createAuthMiddleware(options: AuthOptions) {
  const {
    prefix = '/api/auth',
    ...authOptions
  } = options

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void,
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

      return next()
    }
    catch (error) {
      return next(error as any)
    }
  }
}

export async function getSession(
  req: IncomingMessage,
  options: AuthOptions,
): Promise<Session | null> {
  const { prefix = '/api/auth', ...authOptions } = options
  const nodeHeaders = new Headers()

  for (const key in req.headers) {
    const value = req.headers[key]
    const formattedValue = Array.isArray(value) ? value.filter(Boolean).join(', ') : value
    nodeHeaders.append(key, formattedValue as string)
  }

  const url = new URL(`${prefix}/session`, getURL(req))

  const response = await AuthHandler(
    new Request(url as unknown as RequestInfo, { headers: nodeHeaders }),
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
