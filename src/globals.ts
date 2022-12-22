import {
  AbortController as NodeAbortController,
  Blob as NodeBlob,
  File as NodeFile,
  FormData as NodeFormData,
  Headers as NodeHeaders,
  Request as NodeRequest,
  Response as NodeResponse,
  fetch as nodeFetch,
} from 'node-fetch-native'

declare global {
  namespace NodeJS {
    interface Global {
      Blob: typeof NodeBlob
      File: typeof File

      Headers: typeof Headers
      Request: typeof Request
      Response: typeof Response
      fetch: typeof fetch
      FormData: typeof FormData

      AbortController: typeof AbortController
    }
  }
}

export function installGlobals() {
  globalThis.Blob = NodeBlob
  globalThis.File = NodeFile

  globalThis.Headers = NodeHeaders
  globalThis.Request = NodeRequest
  globalThis.Response = NodeResponse
  globalThis.fetch = nodeFetch
  globalThis.FormData = NodeFormData

  globalThis.AbortController = NodeAbortController
}
