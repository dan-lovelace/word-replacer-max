import {
  browser,
  debounce,
  logDebug,
  replaceAll,
  storageGetByKeys,
} from "@worm/shared";

const render = debounce(renderContent, 20);

async function renderContent(msg = "") {
  const {
    domainList = [],
    matchers = [],
    preferences,
  } = await storageGetByKeys(["domainList", "matchers", "preferences"]);

  if (preferences) {
    const {
      location: { hostname },
    } = window;
    const locationMatch = domainList.some((domain) =>
      hostname.includes(domain)
    );
    let isAllowed = false;

    switch (preferences.domainListEffect) {
      case "allow": {
        isAllowed = locationMatch;
        break;
      }

      case "deny": {
        isAllowed = !locationMatch;
        break;
      }
    }

    if (!isAllowed) {
      return logDebug("Domain blocked");
    }
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
        render("mutation");
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener("readystatechange", () => {
  renderContent("document readystatechange");
});

startContentListeners();
