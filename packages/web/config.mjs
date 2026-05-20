const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://OPENCRAFT.ai" : `https://${stage}.OPENCRAFT.ai`,
  console: stage === "production" ? "https://OPENCRAFT.ai/auth" : `https://${stage}.OPENCRAFT.ai/auth`,
  email: "contact@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/anomalyco/OPENCRAFT",
  discord: "https://OPENCRAFT.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
