import type { IncomingMessage } from 'http'
import { describe, expect, it } from 'vitest'
import { createNodeHeaders, createNodeRequest } from '../src/fetch'

describe('createNodeHeaders', () => {
  it('should iterate over all headers and create a new Headers object', () => {
    const requestHeaders: IncomingMessage['headers'] = {
      header1: ['value1', 'value2'],
      header2: 'value3',
    }

    const result = createNodeHeaders(requestHeaders)

    expect(result.get('header1')).toBe('value1, value2')
    expect(result.get('header2')).toBe('value3')
  })
})

describe('createNodeRequest', () => {
  it('should create a new Request object with the correct URL and method based on the incoming message', () => {
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
        'x-forwarded-host': 'localhost',
      },
      url: '/api/auth',
    }

    const request = createNodeRequest(req as any)

    expect(request.url).toBe('http://localhost/api/auth')
    expect(request.method).toBe('POST')
  })
})
