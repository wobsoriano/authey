declare module '@polka/send-type' {
  import { ServerResponse } from 'node:http'
  function send(res: ServerResponse, status: number, data: string, headers?: Record<string, string>): void
  export = send
}
