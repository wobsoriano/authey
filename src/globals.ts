import {
  ReadableStream as NodeReadableStream,
  WritableStream as NodeWritableStream,
} from '@web-std/stream'

import {
  FormData as NodeFormData,
  Headers as NodeHeaders,
  Request as NodeRequest,
  Response as NodeResponse,
  fetch as nodeFetch,
} from '@web-std/fetch'
import { Blob as NodeBlob, File as NodeFile } from '@web-std/file'

declare global {
  namespace NodeJS {
    interface Global {
      Blob: typeof Blob
      File: typeof File

      Headers: typeof Headers
      Request: typeof Request
      Response: typeof Response
      fetch: typeof fetch
      FormData: typeof FormData

      ReadableStream: typeof ReadableStream
      WritableStream: typeof WritableStream
    }
  }
}

export function installGlobals() {
  global.Blob = NodeBlob
  global.File = NodeFile

  global.Headers = NodeHeaders as unknown as typeof Headers
  global.Request = NodeRequest as unknown as typeof Request
  global.Response = NodeResponse as unknown as typeof Response
  global.fetch = nodeFetch as typeof fetch
  global.FormData = NodeFormData

  global.ReadableStream = NodeReadableStream
  global.WritableStream = NodeWritableStream
}
