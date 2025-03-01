import { getEnvConfig } from "./";

export function isWebAppMessagingAllowed(location: Location) {
  const envConfig = getEnvConfig();

  return (
    new URL(envConfig.VITE_SSM_WEBAPP_ORIGIN).hostname === location.hostname
  );
}
