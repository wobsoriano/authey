import * as nodeFetch from 'node-fetch-native'

export function installGlobals() {
  function define<S extends keyof typeof globalThis>(name: S) {
    if (!globalThis[name]) {
      Object.defineProperty(globalThis, name, {
        value: (nodeFetch as any)[name],
        writable: false,
        configurable: true,
      })
    }
  }

  define('fetch')
  define('AbortController')
  define('Blob')
  define('File')
  define('FormData')
  define('Headers')
  define('Request')
  define('Response')
}
