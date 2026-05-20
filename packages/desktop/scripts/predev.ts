import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.OPENCRAFT_CHANNEL ?? "dev"}`

await $`cd ../OPENCRAFT && bun script/build-node.ts`
