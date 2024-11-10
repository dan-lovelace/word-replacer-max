import { createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import {
  browser,
  convertStoredMatchers,
  POPUP_POPPED_OUT_PARAMETER_KEY,
} from "@worm/shared/src/browser";
import {
  Storage,
  StorageChange,
  StorageProvider,
} from "@worm/types/src/storage";

import { getUpdatedStorage } from "../lib/storage";
import { PreactChildren } from "../lib/types";

type ConfigStore = {
  isPoppedOut: boolean;
  storage: Storage;
};

const storeDefaults: ConfigStore = {
  isPoppedOut: false,
  storage: {
    local: {},
    session: {
      authAccessToken: undefined,
      authClockDrift: undefined,
      authIdToken: undefined,
      authLastAuthUser: undefined,
      authRefreshToken: undefined,
    },
    sync: {
      domainList: [],
      matchers: [],
    },
  },
};

const Config = createContext<ConfigStore>(storeDefaults);

export const useConfig = () => useContext(Config);

export function ConfigProvider({ children }: { children: PreactChildren }) {
  const [initialized, setInitialized] = useState(false);
  const [storage, setStorage] = useState<Storage>(storeDefaults.storage);

  const isPoppedOut = useMemo(
    () =>
      new URLSearchParams(window.location.search).get(
        POPUP_POPPED_OUT_PARAMETER_KEY
      ) === "true",
    []
  );

  useEffect(() => {
    const updateStorage = async (
      changes?: Record<string, StorageChange>,
      areaName?: string
    ) => {
      if (changes === undefined) {
        // Initial load - get all storage areas
        const local = await browser.storage.local.get();
        const session = await browser.storage.session.get();
        const sync = await browser.storage.sync.get();

        const syncMatchers = convertStoredMatchers(sync);

        setStorage({
          local,
          session,
          sync: {
            ...sync,
            matchers: syncMatchers,
          },
        });

        return;
      }

      setStorage((prevStorage) =>
        getUpdatedStorage(prevStorage, changes, areaName as StorageProvider)
      );
    };

    updateStorage().then(() => {
      setInitialized(true);
    });

    browser.storage.onChanged.addListener(updateStorage);

    return () => {
      browser.storage.onChanged.removeListener(updateStorage);
    };
  }, []);

  if (!initialized) {
    return <></>;
  }

  return (
    <Config.Provider value={{ isPoppedOut, storage }}>
      {children}
    </Config.Provider>
  );
}
