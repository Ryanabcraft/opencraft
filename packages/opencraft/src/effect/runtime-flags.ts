import { Config, ConfigProvider, Context, Effect, Layer } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("OPENCRAFT_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: bool(name) }).pipe(Config.map((flags) => flags.experimental || flags.enabled))

export class Service extends ConfigService.Service<Service>()("@OPENCRAFT/RuntimeFlags", {
  autoShare: bool("OPENCRAFT_AUTO_SHARE"),
  pure: bool("OPENCRAFT_PURE"),
  disableDefaultPlugins: bool("OPENCRAFT_DISABLE_DEFAULT_PLUGINS"),
  diffViewer: bool("OPENCRAFT_DIFF_VIEWER"),
  disableChannelDb: bool("OPENCRAFT_DISABLE_CHANNEL_DB"),
  disableEmbeddedWebUi: bool("OPENCRAFT_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("OPENCRAFT_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("OPENCRAFT_DISABLE_LSP_DOWNLOAD"),
  skipMigrations: bool("OPENCRAFT_SKIP_MIGRATIONS"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("OPENCRAFT_DISABLE_CLAUDE_CODE"),
    direct: bool("OPENCRAFT_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("OPENCRAFT_DISABLE_CLAUDE_CODE"),
    direct: bool("OPENCRAFT_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("OPENCRAFT_ENABLE_EXA"),
    legacy: bool("OPENCRAFT_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("OPENCRAFT_ENABLE_PARALLEL"),
    legacy: bool("OPENCRAFT_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("OPENCRAFT_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("OPENCRAFT_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_SCOUT"),
  experimentalBackgroundSubagents: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("OPENCRAFT_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("OPENCRAFT_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("OPENCRAFT_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: enabledByExperimental("OPENCRAFT_EXPERIMENTAL_NATIVE_LLM"),
  client: Config.string("OPENCRAFT_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export * as RuntimeFlags from "./runtime-flags"
