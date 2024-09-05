import { isDomainAllowed, replaceAll } from "@worm/shared";
import {
  getStylesheet,
  STYLE_ELEMENT_ID,
} from "@worm/shared/src/replace/lib/style";
import { storageGetByKeys } from "@worm/shared/src/storage";
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
        const newStyleElement = getStylesheet(storage.replacementStyle);

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
