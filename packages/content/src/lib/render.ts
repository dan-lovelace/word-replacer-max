import { isDomainAllowed, replaceAll } from "@worm/shared";
import { getMatcherGroups } from "@worm/shared/src/browser";
import {
  getTokenGroups,
  groupsHavePermission,
} from "@worm/shared/src/permission";
import {
  getStylesheet,
  STYLE_ELEMENT_ID,
} from "@worm/shared/src/replace/lib/style";
import {
  authStorageProvider,
  storageGetByKeys,
} from "@worm/shared/src/storage";
import { UserGroups } from "@worm/types/src/permission";
import { SyncStorage } from "@worm/types/src/storage";

type Cacheable<T> = {
  expires: number;
  value?: T;
};

type RenderCache = {
  storage: Cacheable<SyncStorage>;
  styleElement: Cacheable<Element>;
  userGroups: Cacheable<UserGroups | undefined>;
};

const RENDER_STORAGE_CACHE_LENGTH_MS = 100;
const RENDER_STYLE_CACHE_LENGTH_MS = 1000;
const RENDER_USER_GROUPS_CACHE_LENGTH_MS = 400;

const renderCache: RenderCache = {
  storage: {
    expires: 0,
  },
  styleElement: {
    expires: 0,
  },
  userGroups: {
    expires: 0,
  },
};

export async function renderContent(msg = "") {
  const now = new Date().getTime();

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

  if (now > renderCache.userGroups.expires) {
    const idToken = (await authStorageProvider.get("authIdToken"))
      .authIdToken as string | undefined;
    const groups = getTokenGroups(idToken);

    renderCache.userGroups.expires = now + RENDER_USER_GROUPS_CACHE_LENGTH_MS;
    renderCache.userGroups.value = groups;
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
    userGroups,
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
      const groupedMatchers = new Set(
        Object.values(matcherGroups)
          .filter((group) => group.active)
          .map((group) => [...(group.matchers ?? [])])
          .flat()
      );

      if (groupedMatchers.size > 0) {
        renderedMatchers = renderedMatchers.filter((matcher) =>
          groupedMatchers.has(matcher.identifier)
        );
      }
    }
  }

  replaceAll(renderedMatchers, replacementStyle);
}
