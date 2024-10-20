import { getEnvConfig } from "@worm/shared/src/config";

export function getReCaptchaToken() {
  return window.grecaptcha.execute(getEnvConfig().VITE_RECAPTCHA_SITE_KEY, {
    action: "submit",
  });
}
