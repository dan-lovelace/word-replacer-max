import {
  browser,
  debounce,
  logDebug,
  replaceAll,
  storageGetByKeys,
} from "@worm/shared";
import { Storage } from "@worm/types";

type RenderCache = {
  storage: {
    expires: number;
    value: Storage;
  };
};

const render = debounce(renderContent, 20);
const RENDER_STORAGE_CACHE_LENGTH_MS = 100;

const renderCache: RenderCache = {
  storage: {
    expires: 0,
    value: {},
  },
};

async function renderContent(msg = "") {
  const now = new Date().getTime();

  if (now > renderCache.storage.expires) {
    const storage = await storageGetByKeys([
      "domainList",
      "matchers",
      "preferences",
    ]);

    renderCache.storage.expires = now + RENDER_STORAGE_CACHE_LENGTH_MS;
    renderCache.storage.value = storage;
  }

  const {
    storage: {
      value: { domainList = [], matchers = [], preferences },
    },
  } = renderCache;

  if (preferences) {
    if (!preferences.extensionEnabled) {
      return;
    }

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
