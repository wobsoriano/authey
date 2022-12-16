import type { IncomingMessage, ServerResponse } from 'node:http'
import getURL from 'requrl'

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

// Taken from https://github.com/hattipjs/hattip/blob/main/packages/adapter/adapter-node/src/common.ts
export async function sendNodeResponse(
  res: ServerResponse,
  nodeResponse: Response,
): Promise<void> {
  res.statusMessage = nodeResponse.statusText
  res.statusCode = nodeResponse.status

  // @ts-expect-error: Node-fetch non-spec method returning all headers and their values as array
  for (const [key, values] of Object.entries(nodeResponse.headers.raw())) {
    // @ts-expect-error: Node-fetch non-spec method returning all headers and their values as array
    for (const value of values)
      res.setHeader(key, value)
  }

  const contentLengthSet = nodeResponse.headers.get('content-length')
  if (nodeResponse.body) {
    if (contentLengthSet) {
      for await (let chunk of nodeResponse.body as any) {
        chunk = Buffer.from(chunk)
        res.write(chunk)
      }
    }
    else {
      const reader = (
        nodeResponse.body as any as AsyncIterable<Buffer | string>
      )[Symbol.asyncIterator]()

      const first = await reader.next()
      if (first.done) {
        res.setHeader('content-length', '0')
      }
      else {
        const secondPromise = reader.next()
        let second = await Promise.race([
          secondPromise,
          Promise.resolve(null),
        ])

        if (second && second.done) {
          res.setHeader('content-length', first.value.length)
          res.write(first.value)
        }
        else {
          res.write(first.value)
          second = await secondPromise
          for (; !second.done; second = await reader.next())
            res.write(Buffer.from(second.value))
        }
      }
    }
  }
  else if (!contentLengthSet) {
    res.setHeader('content-length', '0')
  }

  res.end()
}
