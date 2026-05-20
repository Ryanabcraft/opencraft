export * from "./client.js"
export * from "./server.js"

import { createOPENCRAFTClient } from "./client.js"
import { createOPENCRAFTServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createOPENCRAFT(options?: ServerOptions) {
  const server = await createOPENCRAFTServer({
    ...options,
  })

  const client = createOPENCRAFTClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
