import { addons, types } from "storybook/manager-api"
import { ThemeTool } from "./theme-tool"

addons.register("OPENCRAFT/theme-toggle", () => {
  addons.add("OPENCRAFT/theme-toggle/tool", {
    type: types.TOOL,
    title: "Theme",
    match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
    render: ThemeTool,
  })
})
