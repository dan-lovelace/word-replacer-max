import { Matcher, RenderRate } from "@worm/types/src/rules";
import { SyncStorage } from "@worm/types/src/storage";

import { debounce } from "../debounce";
import { isDomainAllowed } from "../domains";
import { replaceAll } from "../replace";
import {
  DEFAULT_RENDER_RATE,
  DEFAULT_RENDER_RATE_MS,
} from "../replace/lib/render";
import { getStylesheet, STYLE_ELEMENT_ID } from "../replace/lib/style";
import { localStorageProvider, storageGetByKeys } from "../storage";

import { browser } from "./browser";
import { getMatcherGroups, matchersFromStorage } from "./matchers";

interface Cacheable<T> {
  expires: number;
  value?: T;
}

interface RenderCache {
  storage: Cacheable<RenderStorage>;
  styleElement: Cacheable<Element>;
}

interface RenderStorage extends SyncStorage {
  matchers: Matcher[];
}

const OBSERVE_PARAMS = {
  childList: true,
  subtree: true,
};

const RENDER_STORAGE_CACHE_LENGTH_MS = 100;
const RENDER_STYLE_CACHE_LENGTH_MS = 1000;

export class Renderer {
  private isInitialRender = true;

  private mutationObserver: MutationObserver | null = null;

  private observedElement: HTMLElement = document.documentElement;

  private renderCache: RenderCache = {
    storage: {
      expires: 0,
    },
    styleElement: {
      expires: 0,
    },
  };

  private renderFrequency: number = DEFAULT_RENDER_RATE.frequency;

  constructor() {
    this.init();
  }

  private init() {
    document.addEventListener("readystatechange", () => {
      this.renderContent("document state change");
    });

    /**
     * Re-render whenever storage changes.
     */
    browser.storage.onChanged.addListener((event) => {
      const renderRateKey: keyof SyncStorage = "renderRate";

      if (Object.keys(event).includes(renderRateKey)) {
        const newRenderRate = event[renderRateKey].newValue as RenderRate;

        this.renderFrequency = newRenderRate.frequency;
      }

      this.renderContent();
    });

    /**
     * Configured custom render rate if one exists.
     */
    storageGetByKeys(["renderRate"]).then((data) => {
      if (data.renderRate !== undefined) {
        const storedFrequency = Number(data.renderRate?.frequency);

        if (!isNaN(storedFrequency)) {
          this.renderFrequency = storedFrequency;
        }
      }

      this.isInitialRender = false;
    });

    /**
     * Listen for changes to the document and render when they occur.
     */
    const mutationRender = debounce(this.renderContent, () =>
      this.isInitialRender ? DEFAULT_RENDER_RATE_MS : this.renderFrequency
    );

    this.mutationObserver = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          mutationRender("mutation");
          break;
        }
      }
    });

    this.mutationObserver.observe(this.observedElement, OBSERVE_PARAMS);
  }

  private renderContent = async (message = "") => {
    const now = new Date().getTime();

    if (now > this.renderCache.storage.expires) {
      const syncStorage = await storageGetByKeys();
      const matcherStorage = syncStorage.ruleSync?.active
        ? syncStorage
        : await localStorageProvider.get();
      const matchers = matchersFromStorage(matcherStorage) ?? [];
      const storage: RenderStorage = {
        ...syncStorage,
        matchers,
      };

      this.renderCache.storage.expires = now + RENDER_STORAGE_CACHE_LENGTH_MS;
      this.renderCache.storage.value = storage;

      if (now > this.renderCache.styleElement.expires) {
        const renderCacheExpires = now + RENDER_STYLE_CACHE_LENGTH_MS;
        const existingStyleElement = document.head.querySelector(
          `#${STYLE_ELEMENT_ID}`
        );

        if (existingStyleElement) {
          this.renderCache.styleElement = {
            expires: renderCacheExpires,
            value: existingStyleElement,
          };
        } else {
          const newStyleElement = getStylesheet(storage.replacementStyle);

          document.head.appendChild(newStyleElement);

          this.renderCache.styleElement = {
            expires: renderCacheExpires,
            value: newStyleElement,
          };
        }
      }
    }

    if (!this.renderCache.storage.value) {
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
    } = this.renderCache;

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

    this.mutationObserver?.disconnect();

    try {
      replaceAll(renderedMatchers, replacementStyle);
    } finally {
      this.mutationObserver?.observe(this.observedElement, OBSERVE_PARAMS);
    }
  };
}
