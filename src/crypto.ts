import crypto from 'node:crypto'

export function installCrypto() {
  if (globalThis.crypto)
    return

  Object.defineProperty(globalThis, 'crypto', {
    value: crypto.webcrypto,
    writable: false,
    configurable: true,
  })
}
