import { useEffect } from "react";
import { NavigateOptions, To, useNavigate } from "react-router-dom";

import { ROUTES } from "../../lib/routes";

type RedirectProps = {
  options?: NavigateOptions & {
    isExternal: boolean;
  };
  to: To;
};

export default function Redirect({ options, to }: RedirectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (options?.isExternal) {
      if (options.replace) {
        const previousUrl = document.referrer || ROUTES.HOME;

        window.history.replaceState({}, "", previousUrl);
      }

      window.location.assign(to as string);
    } else {
      navigate(to, options);
    }
  }, []);

  return false;
}
