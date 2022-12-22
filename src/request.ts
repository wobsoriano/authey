import type { IncomingMessage, ServerResponse } from 'node:http'
import getURL from 'requrl'
import send from '@polka/send-type'

export function createNodeHeaders(requestHeaders: IncomingMessage['headers']): Headers {
  const headers = new Headers()

  for (const [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values)
          headers.append(key, value)
      }
      else {
        headers.set(key, values)
      }
    }
  }

  return headers
}

export function createNodeRequest(req: IncomingMessage): Request {
  const origin = getURL(req)
  const url = new URL(req.url as string, origin)

  const init: RequestInit = {
    method: req.method,
    headers: createNodeHeaders(req.headers),
  }

  if (req.method !== 'GET' && req.method !== 'HEAD')
    init.body = req as any

  return new Request(url.href, init)
}

export async function sendNodeResponse(
  res: ServerResponse,
  nodeResponse: Response,
): Promise<void> {
  // @ts-expect-error: Node-fetch non-spec method returning all headers and their values as array
  console.log(nodeResponse.headers.raw())
  // @ts-expect-error: Node-fetch non-spec method returning all headers and their values as array
  for (const [key, values] of Object.entries(nodeResponse.headers.raw())) {
    // @ts-expect-error: Node-fetch non-spec method returning all headers and their values as array
    for (const value of values)
      res.setHeader(key, value)
  }

  return send(res, nodeResponse.status, await nodeResponse.text())
}
