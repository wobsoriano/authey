# Authey

Expose [Auth.js](https://authjs.dev/) [REST APIs](https://authjs.dev/reference/rest-api) to your express/[connect](https://www.npmjs.com/package/connect) apps.

## Installation

```bash
npm install @auth/core authey
```

## Usage

Express

```ts
import express from 'express'

import { createAuthMiddleware } from 'authey'
import type { AuthConfig } from '@auth/core'
import GithubProvider from '@auth/core/providers/github'

const app = express()

const authOptions: AuthConfig = {
  // You can generate a secret here https://generate-secret.vercel.app/32
  secret: process.env.AUTH_SECRET,
  trustHost: Boolean(process.env.AUTH_TRUST_HOST),
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

export default fromNodeMiddleware(createAuthMiddleware(authOptions))
```

Fastify

```ts
import Fastify from 'fastify'
import Middie from '@fastify/middie'
import { createAuthMiddleware } from 'authey'

async function build() {
  const fastify = Fastify()
  await fastify.register(Middie)
  fastify.use(createAuthMiddleware(authOptions))
  return fastify
}

// Plugin: https://github.com/wobsoriano/fastify-next-auth
```

## License

MIT
