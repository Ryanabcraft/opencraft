# Session LLM Runtime Boundaries

`../llm.ts` is the OPENCRAFT session LLM service. It owns OPENCRAFT concerns: auth, config, model/provider resolution, plugins, permissions, telemetry headers, and runtime selection.

This folder contains adapters behind that service boundary:

- `ai-sdk.ts` converts AI SDK `fullStream` parts into `@OPENCRAFT-ai/llm` `LLMEvent`s. This is the default runtime path.
- `native-request.ts` converts OPENCRAFT's normalized session input into a native `@OPENCRAFT-ai/llm` `LLMRequest`. It does not execute requests.
- `native-runtime.ts` is the opt-in native runtime adapter. It decides whether a selected model is supported, builds the native request, bridges OPENCRAFT tools into native executable tools, and delegates transport to `LLMClient` / `RequestExecutor`.

## Runtime selection

Both runtimes converge on the same `LLMEvent` stream consumed by the session processor. The gate is per-request: a single session can route some calls through native and fall back for others.

```txt
                             ╭───────────────────╮
╭───────────────────────────▶│ session processor │
│                            ╰─────────┬─────────╯
│                                      │
│                                      │
│                                      │
│                                      ▼
│                         ╭─────────────────────────╮
│                         │ LLM.Service (../llm.ts) │
│                         ╰────────────┬────────────╯
│                                      │
│                                      │
│                                      │
│                                      ▼
│                                ╭───────────╮
│                              ╭─╯           ╰─╮
│                              │  native gate  │
│                              ╰─╮           ╭─╯
│                                ╰─────┬─────╯
│                                      │
│                     ╭────── no ──────┴─────── yes ────────╮
│                     │                                     │
│                     ▼                                     ▼
│       ╭───────────────────────────╮             ╭───────────────────╮
│       │          AI SDK           │             │ native-runtime.ts │
│       │ streamText / generateText │             ╰────────┬──────────╯
│       ╰─────────────┬─────────────╯                      │
│                     │                                    │
│                 ╭───╯                                    │
│                 │                                        │
│                 ▼                                        ▼
│     ╭───────────────────────╮             ╭────────────────────────────╮
│     │       ai-sdk.ts       │             │     native-request.ts      │
│     │ fullStream → LLMEvent │             │ session input → LLMRequest │
│     ╰──────────┬────────────╯             ╰──────────────┬─────────────╯
│                │                                         │
│                │                                     ╭───╯
│                │                                     │
│                ▼                                     ▼
│       ╭─────────────────╮             ╭─────────────────────────────╮
╰───────┤ LLMEvent stream │◀────────────┤ LLMClient · RequestExecutor │
        ╰─────────────────╯             ╰─────────────────────────────╯
```

`native-runtime.ts` evaluates the gate and either bridges into `@OPENCRAFT-ai/llm` or returns control so `llm.ts` can take the AI SDK path. Tool execution stays OPENCRAFT-owned in both branches; only request lowering and transport differ.

Safety boundary:

- AI SDK remains the default.
- `OPENCRAFT_EXPERIMENTAL_NATIVE_LLM=true` or the umbrella `OPENCRAFT_EXPERIMENTAL=true` opts in. Native is not a global replacement.
- Native execution currently runs only for OpenAI-compatible Responses models exposed through `@ai-sdk/openai`: direct `openai` API-key auth and console-managed `OPENCRAFT`/Zen API-key config.
- Unsupported providers, OpenAI OAuth, and missing API-key cases fall back to AI SDK.
