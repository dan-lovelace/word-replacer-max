import { isDomainAllowed, replaceAll } from "@worm/shared";
import { getMatcherGroups } from "@worm/shared/src/browser";
import {
  getStylesheet,
  STYLE_ELEMENT_ID,
} from "@worm/shared/src/replace/lib/style";
import { storageGetByKeys } from "@worm/shared/src/storage";
import { SyncStorage } from "@worm/types/src/storage";

type Cacheable<T> = {
  expires: number;
  value?: T;
};

type RenderCache = {
  storage: Cacheable<SyncStorage>;
  styleElement: Cacheable<Element>;
};

const RENDER_STORAGE_CACHE_LENGTH_MS = 100;
const RENDER_STYLE_CACHE_LENGTH_MS = 1000;

export const renderCache: RenderCache = {
  storage: {
    expires: 0,
  },
  styleElement: {
    expires: 0,
  },
};

export async function renderContent(msg = "") {
  const now = Date.now();

  if (now > renderCache.storage.expires) {
    const storage = await storageGetByKeys();

    renderCache.storage.expires = now + RENDER_STORAGE_CACHE_LENGTH_MS;
    renderCache.storage.value = storage;

    if (now > renderCache.styleElement.expires) {
      const renderCacheExpires = now + RENDER_STYLE_CACHE_LENGTH_MS;
      const existingStyleElement = document.head.querySelector(
        `#${STYLE_ELEMENT_ID}`
      );

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
    // storage does not exist, unable to continue
    return;
  }

  const {
    storage: {
      value: syncStorage,
      value: {
        domainList = [],
        matchers = [],
        preferences,
        replacementStyle,
        ruleGroups,
      },
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

  let renderedMatchers = [...matchers];

  if (ruleGroups?.active) {
    const matcherGroups = getMatcherGroups(syncStorage);

    if (matcherGroups !== undefined) {
      const activeGroups = Object.values(matcherGroups).filter(
        (group) => group.active
      );
      const groupedMatchers = new Set(
        activeGroups.map((group) => [...(group.matchers ?? [])]).flat()
      );

      if (groupedMatchers.size > 0 || activeGroups.length > 0) {
        renderedMatchers = renderedMatchers.filter((matcher) =>
          groupedMatchers.has(matcher.identifier)
        );
      }
    }
  }

  if (renderedMatchers.length < 1) return;

  replaceAll(renderedMatchers, replacementStyle);
}
