import { debounce } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";
import { DEFAULT_RENDER_RATE_MS } from "@worm/shared/src/replace/lib/render";
import { storageGetByKeys } from "@worm/shared/src/storage";
import { RenderRate } from "@worm/types/src/rules";
import { SyncStorage } from "@worm/types/src/storage";

import { renderContent } from "./render";

let isInitialRender = true;
let renderFrequencyMs = DEFAULT_RENDER_RATE_MS;

const render = debounce(renderContent, () =>
  isInitialRender ? DEFAULT_RENDER_RATE_MS : renderFrequencyMs
);

export function startContentListeners() {
  /**
   * Re-render whenever storage changes.
   */
  browser.storage.onChanged.addListener((event) => {
    const renderRateKey: keyof SyncStorage = "renderRate";

    if (Object.keys(event).includes(renderRateKey)) {
      const newRenderRate = event[renderRateKey].newValue as RenderRate;

      renderFrequencyMs = newRenderRate.frequency;
    }

    renderContent();
  });

  /**
   * Configured custom render rate if one exists.
   */
  storageGetByKeys(["renderRate"]).then((data) => {
    if (data.renderRate !== undefined) {
      const storedFrequency = Number(data.renderRate?.frequency);

      if (!isNaN(storedFrequency)) {
        renderFrequencyMs = storedFrequency;
      }
    }

    isInitialRender = false;
  });

  /**
   * Listen for changes to the document and render when they occur.
   */
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        render("mutation");
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
