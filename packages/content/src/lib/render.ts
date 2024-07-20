import {
  isDomainAllowed,
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

const RENDER_STORAGE_CACHE_LENGTH_MS = 100;

const renderCache: RenderCache = {
  storage: {
    expires: 0,
    value: {},
  },
};

export async function renderContent(msg = "") {
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

    if (!isDomainAllowed(domainList, preferences)) {
      return logDebug("Domain blocked");
    }
  }

  replaceAll(matchers);
}
