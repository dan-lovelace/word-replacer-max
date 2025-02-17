import { debounce } from "@worm/shared";
import { browser } from "@worm/shared/src/browser";

import { renderContent } from "./render";

const render = debounce(renderContent, 20);

export function startContentListeners() {
  /**
   * Re-render whenever storage changes.
   */
  browser.storage.onChanged.addListener(() => renderContent());

  /**
   * Listen for changes to the document and render when they occur.
   */
  const observer = new MutationObserver((mutationList) => {
    const hasTextChanges = mutationList.some(
      (mutation) =>
        mutation.type === "characterData" ||
        Array.from(mutation.addedNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE || node.hasChildNodes()
        )
    );

    if (hasTextChanges) {
      render("mutation");
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
