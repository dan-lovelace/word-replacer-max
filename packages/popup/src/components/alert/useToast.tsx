import { createWebAppMessage } from "@worm/shared";
import { ShowToastMessageOptions } from "@worm/types/src/message";

import { useLanguage } from "../../lib/language";

type UseToastResult = {
  showRefreshToast: (shouldShow?: boolean) => void;
  showToast: (options: ShowToastMessageOptions) => void;
};

export function useToast(): UseToastResult {
  const language = useLanguage();

  const showRefreshToast = (shouldShow = true) => {
    if (!shouldShow) return;

    showToast({
      message: language.rules.REFRESH_REQUIRED,
      options: {
        showRefresh: true,
      },
    });
  };

  const showToast = (options: ShowToastMessageOptions) => {
    const toastEvent = createWebAppMessage("showToastMessage", options);

    window.postMessage(toastEvent);
  };

  return {
    showRefreshToast,
    showToast,
  };
}
