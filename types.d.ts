declare module '@polka/send-type' {
  import type { ServerResponse } from 'node:http'

  function send(res: ServerResponse, status: number, data: string, headers?: Record<string, string>): void
  export default send
}
