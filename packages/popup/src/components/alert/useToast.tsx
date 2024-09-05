import { createToastMessage, ShowToastMessageOptions } from ".";

type UseToastResult = {
  showToast: (options: ShowToastMessageOptions) => void;
};

export function useToast(): UseToastResult {
  const showToast = (options: ShowToastMessageOptions) => {
    const toastEvent = createToastMessage("showToastMessage", options);

    window.postMessage(toastEvent);
  };

  return {
    showToast,
  };
}
