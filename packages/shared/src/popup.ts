import { browser } from "./browser";
import { logDebug } from "./logging";

const POPUP_FILENAME = "popup.html";

export const POPUP_POPPED_OUT_PARAMETER_KEY = "expanded";
export const POPUP_ROUTES = {
  HOME: `/${POPUP_FILENAME}`,
};

export async function popoutExtension() {
  const popupLocation = browser.runtime.getURL(POPUP_FILENAME);
  const url = `${popupLocation}?${POPUP_POPPED_OUT_PARAMETER_KEY}=true`;

  const open = await browser.windows.create({
    url,
    type: "popup",
    height: 700,
    width: 900,
  });

  if (!open) {
    logDebug("Error opening popup");
  }

  return open;
}
