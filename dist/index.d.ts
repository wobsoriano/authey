import { IncomingMessage, ServerResponse } from 'http';
import { Session, AuthConfig as AuthConfig$1 } from '@auth/core/types';

interface AuthConfig extends AuthConfig$1 {
    /**
     * Defines the base path for the auth routes.
     * If you change the default value,
     * you must also update the callback URL used by the [providers](https://authjs.dev/reference/core/modules/providers).
     *
     * @default '/api/auth'
     */
    prefix?: string;
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
declare function createAuthMiddleware(options: AuthConfig): (req: IncomingMessage, res: ServerResponse, next?: ((err?: Error) => void) | undefined) => Promise<void>;
declare function getSession(req: IncomingMessage, options: AuthConfig): Promise<Session | null>;

export { createAuthMiddleware, getSession };
