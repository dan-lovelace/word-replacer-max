import { createToastMessage, ShowToastMessageOptions } from ".";

type UseToastResult = {
  showToast: (options: ShowToastMessageOptions) => void;
};

export function useToast(): UseToastResult {
  const showToast = (event: ShowToastMessageOptions) => {
    const toastEvent = createToastMessage("showToastMessage", event);

    window.postMessage(toastEvent);
  };

  return {
    showToast,
  };
}
