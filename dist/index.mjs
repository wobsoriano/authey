// src/index.ts
import { Auth } from "@auth/core";
import getURL2 from "requrl";

// src/fetch.ts
import getURL from "requrl";
import send from "@polka/send-type";
import { splitCookiesString } from "set-cookie-parser";
function createNodeHeaders(requestHeaders) {
  const headers = new Headers();
  for (const [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values)
          headers.append(key, value);
      } else {
        headers.set(key, values);
      }
    }
  }
  return headers;
}
function createNodeRequest(req) {
  const origin = getURL(req);
  const url = new URL(req.url, origin);
  const init = {
    method: req.method,
    headers: createNodeHeaders(req.headers),
    duplex: "half"
  };
  if (req.method !== "GET" && req.method !== "HEAD")
    init.body = req;
  return new Request(url.href, init);
}
async function sendNodeResponse(res, nodeResponse) {
  for (const [key, value] of nodeResponse.headers.entries()) {
    if (key === "set-cookie") {
      const cookies = splitCookiesString(nodeResponse.headers.get("set-cookie"));
      res.setHeader("set-cookie", cookies);
    } else {
      res.setHeader(key, value);
    }
  }
  return send(res, nodeResponse.status, await nodeResponse.text());
}

// src/crypto.ts
import crypto from "crypto";
function installCrypto() {
  if (globalThis.crypto)
    return;
  Object.defineProperty(globalThis, "crypto", {
    value: crypto.webcrypto,
    writable: false,
    configurable: true
  });
}

// src/globals.ts
import * as nodeFetch from "node-fetch-native";
function installGlobals() {
  function define(name) {
    if (!globalThis[name]) {
      Object.defineProperty(globalThis, name, {
        value: nodeFetch[name],
        writable: false,
        configurable: true
      });
    }
  }
  define("fetch");
  define("AbortController");
  define("Blob");
  define("File");
  define("FormData");
  define("Headers");
  define("Request");
  define("Response");
}

// src/index.ts
installGlobals();
installCrypto();
var actions = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error"
];
function shouldTrustHost() {
  return !!(process.env.AUTH_TRUST_HOST ?? process.env.VERCEL ?? process.env.NODE_ENV === "development");
}
function createAuthMiddleware(options) {
  const {
    prefix = "/api/auth",
    ...authOptions
  } = options;
  options.secret ?? (options.secret = process.env.AUTH_SECRET);
  options.trustHost ?? (options.trustHost = shouldTrustHost());
  return async (req, res, next) => {
    try {
      const request = createNodeRequest(req);
      const parsedUrl = new URL(request.url);
      const [action] = parsedUrl.pathname.slice(prefix.length + 1).split("/");
      if (actions.includes(action) && parsedUrl.pathname.startsWith(`${prefix}/`)) {
        const response = await Auth(request, authOptions);
        return await sendNodeResponse(res, response);
      }
      return next?.();
    } catch (error) {
      return next?.(error);
    }
  };
}
async function getSession(req, options) {
  const { prefix = "/api/auth", ...authOptions } = options;
  options.secret ?? (options.secret = process.env.AUTH_SECRET);
  options.trustHost ?? (options.trustHost = true);
  const url = new URL(`${prefix}/session`, getURL2(req));
  const request = new Request(url, { headers: createNodeHeaders(req.headers) });
  const response = await Auth(request, authOptions);
  const { status = 200 } = response;
  const data = await response.json();
  if (!data || !Object.keys(data).length)
    return null;
  if (status === 200)
    return data;
  throw new Error(data.message);
}
export {
  createAuthMiddleware,
  getSession
};
