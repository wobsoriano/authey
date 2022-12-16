# Authey

Universal support for [Auth.js](https://authjs.dev/).

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

const authOptions: AuthOptions = {}
app.use(createAuthMiddleware(authOptions))
```

Now, try to access `/api/auth/signin`!

The middleware supports any express/[connect](https://www.npmjs.com/package/connect)-based syntax.

## License

[MIT](./LICENSE) License © 2022 [Robert Soriano](https://github.com/wobsoriano)
