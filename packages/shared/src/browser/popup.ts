import { logDebug } from "../logging";

import { browser } from "./browser";

const POPUP_FILENAME = "popup.html";

export const POPUP_POPPED_OUT_PARAMETER_KEY = "expanded";
export const POPUP_ROUTES = {
  HOME: `/${POPUP_FILENAME}`,
};

export async function popoutExtension(isPopup: boolean) {
  const url = getPopoutURL();
  const baseProps: browser.Tabs.CreateCreatePropertiesType &
    browser.Windows.CreateCreateDataType = {
    url,
  };

  if (isPopup) {
    baseProps.height = 700;
    baseProps.type = "popup";
    baseProps.width = 900;
  }

  const openMethod = isPopup ? browser.windows : browser.tabs;
  const open = await openMethod.create(baseProps);

  if (!open) {
    logDebug("Error opening popup");
  }

  return open;
}

export function getPopoutURL() {
  const popupLocation = browser.runtime.getURL(POPUP_FILENAME);

  return `${popupLocation}?${POPUP_POPPED_OUT_PARAMETER_KEY}=true`;
}
