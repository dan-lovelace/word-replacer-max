import { useEffect } from "react";

import { cx } from "@worm/shared";
import { getEnvConfig } from "@worm/shared/src/config";

import { ButtonProps } from "../button";
import Button from "../button/Button";

interface ReCaptchaV3 {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
  render(
    container: string | HTMLElement,
    parameters: { sitekey: string; theme?: string; size?: string }
  ): number;
  reset(opt_widget_id?: number): void;
  getResponse(opt_widget_id?: number): string;
}

declare global {
  interface Window {
    grecaptcha: ReCaptchaV3;
  }
}

type ReCaptchaProps = ButtonProps;

const { VITE_RECAPTCHA_SITE_KEY } = getEnvConfig();

export default function ReCaptcha({
  children,
  className,
  ...rest
}: ReCaptchaProps) {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = `https://www.google.com/recaptcha/api.js?render=${VITE_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Button className={cx(className, "g-recaptcha")} {...rest}>
      {children}
    </Button>
  );
}
