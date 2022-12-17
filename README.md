# Authey

Expose [Auth.js](https://authjs.dev/) [REST APIs](https://authjs.dev/reference/rest-api) to your express/[connect](https://www.npmjs.com/package/connect) apps.

## Install

```bash
pnpm add @auth/core authey
```

## Usage

Express

```ts
import express from 'express'

import { createAuthMiddleware } from 'authey'
import type { AuthOptions } from '@auth/core'
import GithubProvider from '@auth/core/providers/github'

const app = express()

const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
}

app.use(createAuthMiddleware(authOptions))
```

Nuxt

```ts
// server/middleware/auth.ts
import { createAuthMiddleware } from 'authey'
import { fromNodeMiddleware } from 'h3'

export default fromNodeMiddleware(createAuthMiddleware({}))
```

[Fastify](https://github.com/wobsoriano/fastify-next-auth)

```ts
import Fastify from 'fastify'
import Middie from '@fastify/middie'
import { createAuthMiddleware } from 'authey'

async function build() {
  const fastify = Fastify()
  await fastify.register(Middie)
  fastify.use(createAuthMiddleware({}))
  return fastify
}
```

## License

[MIT](./LICENSE) License © 2022 [Robert Soriano](https://github.com/wobsoriano)
