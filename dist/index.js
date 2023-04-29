"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createAuthMiddleware: () => createAuthMiddleware,
  getSession: () => getSession
});
module.exports = __toCommonJS(src_exports);
var import_core = require("@auth/core");
var import_requrl2 = __toESM(require("requrl"));

// src/fetch.ts
var import_requrl = __toESM(require("requrl"));
var import_send_type = __toESM(require("@polka/send-type"));
var import_set_cookie_parser = require("set-cookie-parser");
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
  const origin = (0, import_requrl.default)(req);
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
      const cookies = (0, import_set_cookie_parser.splitCookiesString)(nodeResponse.headers.get("set-cookie"));
      res.setHeader("set-cookie", cookies);
    } else {
      res.setHeader(key, value);
    }
  }
  return (0, import_send_type.default)(res, nodeResponse.status, await nodeResponse.text());
}

// src/crypto.ts
var import_node_crypto = __toESM(require("crypto"));
function installCrypto() {
  if (globalThis.crypto)
    return;
  Object.defineProperty(globalThis, "crypto", {
    value: import_node_crypto.default.webcrypto,
    writable: false,
    configurable: true
  });
}

// src/globals.ts
var nodeFetch = __toESM(require("node-fetch-native"));
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
        const response = await (0, import_core.Auth)(request, authOptions);
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
  const url = new URL(`${prefix}/session`, (0, import_requrl2.default)(req));
  const request = new Request(url, { headers: createNodeHeaders(req.headers) });
  const response = await (0, import_core.Auth)(request, authOptions);
  const { status = 200 } = response;
  const data = await response.json();
  if (!data || !Object.keys(data).length)
    return null;
  if (status === 200)
    return data;
  throw new Error(data.message);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAuthMiddleware,
  getSession
});
