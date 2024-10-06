import { createWebAppMessage } from "@worm/shared";
import { ShowToastMessageOptions } from "@worm/types/src/message";

type UseToastResult = {
  showToast: (options: ShowToastMessageOptions) => void;
};

export function useToast(): UseToastResult {
  const showToast = (options: ShowToastMessageOptions) => {
    const toastEvent = createWebAppMessage("showToastMessage", options);

    window.postMessage(toastEvent);
  };

  return {
    showToast,
  };
}
