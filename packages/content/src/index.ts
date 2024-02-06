import {
  browser,
  debounce,
  logDebug,
  replaceAll,
  storageGetByKeys,
} from "@worm/shared";

const render = debounce(renderContent, 20);

async function renderContent() {
  const { domainBlocklist = [], matchers = [] } = await storageGetByKeys([
    "domainBlocklist",
    "matchers",
  ]);

  if (
    domainBlocklist.some((domain) => window.location.hostname.includes(domain))
  ) {
    return logDebug("Domain blocked");
  }

  replaceAll(matchers);
}

function startContentListeners() {
  /**
   * Re-render whenever storage changes.
   */
  browser.storage.onChanged.addListener(() => renderContent());

  /**
   * Listen for changes to the document and render when they occur.
   */
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        render(undefined, "mutation");
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

startContentListeners();
renderContent();
