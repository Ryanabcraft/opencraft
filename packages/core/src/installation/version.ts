declare global {
  const OPENCRAFT_VERSION: string
  const OPENCRAFT_CHANNEL: string
}

export const InstallationVersion = typeof OPENCRAFT_VERSION === "string" ? OPENCRAFT_VERSION : "local"
export const InstallationChannel = typeof OPENCRAFT_CHANNEL === "string" ? OPENCRAFT_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
