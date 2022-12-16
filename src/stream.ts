import type { Writable } from 'stream'

export async function writeReadableStreamToWritable(
  stream: ReadableStream,
  writable: Writable,
) {
  const reader = stream.getReader()

  async function read() {
    const { done, value } = await reader.read()

    if (done) {
      writable.end()
      return
    }

    writable.write(value)

    // If the stream is flushable, flush it to allow streaming to continue.
    const flushable = writable as { flush?: Function }
    if (typeof flushable.flush === 'function')
      flushable.flush()

    await read()
  }

  try {
    await read()
  }
  catch (error: any) {
    writable.destroy(error)
    throw error
  }
}
