import type { SuperTest, Test } from 'supertest'
import supertest from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import type { App } from 'h3'
import { createApp, fromNodeMiddleware, toNodeListener } from 'h3'
import GithubProvider from '@auth/core/providers/github'
import type { AuthConfig } from '@auth/core'
import { createAuthMiddleware } from '../src'

const authOptions: AuthConfig = {
  secret: 'SOME_SECRET_FOR_TESTING',
  trustHost: true,
  providers: [
    // @ts-expect-error: TODO
    GithubProvider({
      clientId: '',
      clientSecret: '',
    }),
  ],
}

// IN PROGRESS

describe('REST APIs', () => {
  let app: App
  let request: SuperTest<Test>

  beforeEach(() => {
    app = createApp({ debug: false })
    app.use(fromNodeMiddleware(createAuthMiddleware(authOptions)))
    request = supertest(toNodeListener(app))
  })

  describe('/api/auth/* returns 200 OK', () => {
    test('/session', async () => {
      const res = await request.get('/api/auth/session')
      expect(res.status).toEqual(200)
    })
    test('/signin', async () => {
      const res = await request.get('/api/auth/signin')
      expect(res.status).toEqual(200)
    })
    test('/signout', async () => {
      const res = await request.get('/api/auth/signout')
      expect(res.status).toEqual(200)
    })
    test('/providers', async () => {
      const res = await request.get('/api/auth/providers')
      expect(res.status).toEqual(200)
    })
  })
})
