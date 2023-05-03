import { URL } from 'node:url'
import * as dotenv from 'dotenv'
import express from 'express'
import { createAuthMiddleware, getSession } from 'authey'
import type { AuthConfig } from '@auth/core/types'
import GithubProvider from '@auth/core/providers/github'
dotenv.config()

const app = express()

const authOptions: AuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    // @ts-expect-error: TODO
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
}

app.use(createAuthMiddleware(authOptions))
app.use(express.static(new URL('./public', import.meta.url).pathname))

app.get('/', (req, res) => {
  res.render('index.html')
})

app.get('/api/user', async (req, res) => {
  const session = await getSession(req, authOptions)
  res.json(session)
})

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('server started on port 3000...')
})
