import { Browser } from "webextension-polyfill";

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

export class Renderer {
  private readonly OBSERVE_PARAMS = {
    childList: true,
    subtree: true,
  };
  private readonly RENDER_STORAGE_CACHE_LENGTH_MS = 100;
  private readonly RENDER_STYLE_CACHE_LENGTH_MS = 1000;

  private isInitialRender = true;

  private mutationObserver: MutationObserver | null = null;

  private observedElement: HTMLElement;

  private renderCache: RenderCache = {
    storage: {
      expires: 0,
    },
    styleElement: {
      expires: 0,
    },
  };

  private renderRate: RenderRate = DEFAULT_RENDER_RATE;

  public browser: Browser;

  public renderCount = 0;

  constructor(browser: Browser, element: HTMLElement) {
    this.browser = browser;
    this.observedElement = element;

    this.init();
  }

  private init() {
    if (document.readyState === "complete") {
      this.renderContent("document ready");
    }

    document.addEventListener("readystatechange", () => {
      this.renderContent("document ready state change");
    });

    /**
     * Re-render whenever storage changes.
     */
    this.browser.storage.onChanged.addListener((event) => {
      const renderRateKey: keyof SyncStorage = "renderRate";

      if (Object.keys(event).includes(renderRateKey)) {
        const newRenderRate = event[renderRateKey].newValue as RenderRate;

        this.renderRate = newRenderRate;
      }

      this.renderContent();
    });

    /**
     * Configured custom render rate if one exists.
     */
    this.browser.storage.sync.get("renderRate").then((data) => {
      if (data.renderRate !== undefined) {
        const storedFrequency = Number(
          (data.renderRate as RenderRate).frequency
        );

        if (!isNaN(storedFrequency)) {
          this.renderRate.frequency = storedFrequency;
        }
      }

      this.isInitialRender = false;
    });

    /**
     * Listen for changes to the document and render when they occur.
     */
    const mutationRender = debounce(this.renderContent, () => {
      if (this.isInitialRender) {
        return DEFAULT_RENDER_RATE_MS;
      }

      return this.renderRate.active
        ? this.renderRate.frequency
        : DEFAULT_RENDER_RATE_MS;
    });

    this.mutationObserver = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          mutationRender("mutation");
          break;
        }
      }
    });

    this.mutationObserver.observe(this.observedElement, this.OBSERVE_PARAMS);
  }

  public renderContent = async (message = "") => {
    const now = new Date().getTime();

    if (now > this.renderCache.storage.expires) {
      const syncStorage =
        (await this.browser.storage.sync.get()) as SyncStorage;
      const matcherStorage = syncStorage.ruleSync?.active
        ? syncStorage
        : await this.browser.storage.local.get();
      const matchers = matchersFromStorage(matcherStorage) ?? [];
      const storage: RenderStorage = {
        ...syncStorage,
        matchers,
      };

      this.renderCache.storage.expires =
        now + this.RENDER_STORAGE_CACHE_LENGTH_MS;
      this.renderCache.storage.value = storage;

      if (now > this.renderCache.styleElement.expires) {
        const renderCacheExpires = now + this.RENDER_STYLE_CACHE_LENGTH_MS;
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
      replaceAll(renderedMatchers, replacementStyle, this.observedElement);
    } finally {
      this.renderCount++;
      this.mutationObserver?.observe(this.observedElement, this.OBSERVE_PARAMS);
    }
  };
}
