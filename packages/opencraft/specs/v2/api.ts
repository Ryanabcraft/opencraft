// @ts-nocheck

import { OPENCRAFT } from "@OPENCRAFT-ai/core"
import { ReadTool } from "@OPENCRAFT-ai/core/tools"

const OPENCRAFT = OPENCRAFT.make({})

OPENCRAFT.tool.add(ReadTool)

OPENCRAFT.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

OPENCRAFT.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

OPENCRAFT.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await OPENCRAFT.session.create({
  agent: "build",
})

OPENCRAFT.subscribe((event) => {
  console.log(event)
})

await OPENCRAFT.session.prompt({
  sessionID,
  text: "hey what is up",
})

await OPENCRAFT.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await OPENCRAFT.session.wait()

console.log(await OPENCRAFT.session.messages(sessionID))
