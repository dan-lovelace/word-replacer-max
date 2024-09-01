import {
  isDomainAllowed,
  logDebug,
  replaceAll,
  storageGetByKeys,
} from "@worm/shared";
import { Storage } from "@worm/types";

type Cacheable<T> = {
  expires: number;
  value?: T;
};

type RenderCache = {
  storage: Cacheable<Storage>;
  styleElement: Cacheable<HTMLStyleElement>;
};

const RENDER_STORAGE_CACHE_LENGTH_MS = 100;
const RENDER_STYLE_CACHE_LENGTH_MS = 1000;
const STYLE_ELEMENT_ID = "wrm-style";

const renderCache: RenderCache = {
  storage: {
    expires: 0,
  },
  styleElement: {
    expires: 0,
  },
};

export async function renderContent(msg = "") {
  const now = new Date().getTime();

  if (now > renderCache.storage.expires) {
    const storage = await storageGetByKeys([
      "domainList",
      "matchers",
      "preferences",
      "replacementStyle",
    ]);

    renderCache.storage.expires = now + RENDER_STORAGE_CACHE_LENGTH_MS;
    renderCache.storage.value = storage;

    if (now > renderCache.styleElement.expires) {
      const renderCacheExpires = now + RENDER_STYLE_CACHE_LENGTH_MS;
      const existingStyleElement = document.head.querySelector(
        `#${STYLE_ELEMENT_ID}`
      ) as HTMLStyleElement;

      if (existingStyleElement) {
        renderCache.styleElement = {
          expires: renderCacheExpires,
          value: existingStyleElement,
        };
      } else {
        const newStyleElement = document.createElement("style");
        newStyleElement.id = STYLE_ELEMENT_ID;

        const stylesheet = document.createTextNode(`
          .wrm-style__backgroundColor {
            background-color: ${
              String(storage.replacementStyle?.backgroundColor) || "unset"
            } !important;
          }

          .wrm-style__bold {
            font-weight: 700 !important;
          }

          .wrm-style__color {
            color: ${
              String(storage.replacementStyle?.color) || "unset"
            } !important;
          }

          .wrm-style__italic {
            font-style: italic !important; 
          }

          .wrm-style__strikethrough {
            text-decoration: line-through !important;
          }

          .wrm-style__underline {
            text-decoration: underline !important;
          }

          .wrm-style__strikethrough.wrm-style__underline {
            text-decoration: line-through underline !important;
          }
        `);
        newStyleElement.appendChild(stylesheet);

        document.head.appendChild(newStyleElement);

        renderCache.styleElement = {
          expires: renderCacheExpires,
          value: newStyleElement,
        };
      }
    }
  }

  if (!renderCache.storage.value) {
    return;
  }

  const {
    storage: {
      value: { domainList = [], matchers = [], preferences, replacementStyle },
    },
  } = renderCache;

  if (preferences) {
    if (!preferences.extensionEnabled) {
      return;
    }

    if (!isDomainAllowed(domainList, preferences)) {
      return;
    }
  }

  replaceAll(matchers, replacementStyle);
}
