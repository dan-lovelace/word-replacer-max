import { createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import {
  browser,
  matchersFromStorage,
  matchersToStorage,
  POPUP_POPPED_OUT_PARAMETER_KEY,
  STORAGE_MATCHER_PREFIX,
} from "@worm/shared/src/browser";
import { getStorageProvider, storageSetByKeys } from "@worm/shared/src/storage";
import { Matcher } from "@worm/types/src/rules";
import {
  Storage,
  StorageChange,
  StorageProvider,
  StorageSetOptions,
} from "@worm/types/src/storage";

import { useToast } from "../components/alert/useToast";
import { getUpdatedStorage } from "../lib/storage";
import { PreactChildren } from "../lib/types";

type ConfigStore = {
  isPoppedOut: boolean;
  matchers: Matcher[];
  storage: Storage;

  updateMatchers: (
    newMatchers?: Matcher[],
    options?: StorageSetOptions
  ) => Promise<void>;
};

const storeDefaults: Storage = {
  local: {
    authAccessToken: undefined,
    authClockDrift: undefined,
    authIdToken: undefined,
    authLastAuthUser: undefined,
    authRefreshToken: undefined,
  },
  session: {},
  sync: {},
};

const Config = createContext<ConfigStore>({} as ConfigStore);

export const useConfig = () => useContext(Config);

export function ConfigProvider({ children }: { children: PreactChildren }) {
  const [initialized, setInitialized] = useState(false);
  const [storage, setStorage] = useState<Storage>(storeDefaults);

  const { showToast } = useToast();

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

        setStorage({
          local,
          session,
          sync,
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

  const updateMatchers = async (
    newMatchers?: Matcher[],
    options?: StorageSetOptions
  ) => {
    const isSyncActive = Boolean(storage.sync.ruleSync?.active);
    const provider: StorageProvider = isSyncActive ? "sync" : "local";

    if (!newMatchers || newMatchers.length < 1) {
      /**
       * Matchers are being deleted. Look up all existing matchers in the flat
       * storage structure and remove them.
       */
      await getStorageProvider(provider).remove(
        matchers.map(
          (matcher) => `${STORAGE_MATCHER_PREFIX}${matcher.identifier}`
        )
      );
    } else {
      const updatedMatchers = matchersToStorage(newMatchers);

      storageSetByKeys(updatedMatchers, {
        provider,
        onError(message) {
          showToast({
            message,
            options: { severity: "danger" },
          });
        },
        ...options,
      });
    }
  };

  const matchers = useMemo(() => {
    const isSyncActive = Boolean(storage.sync.ruleSync?.active);
    const allStorage = isSyncActive ? storage.sync : storage.local;
    const storedMatchers = matchersFromStorage(allStorage);

    return storedMatchers ?? [];
  }, [storage]);

  if (!initialized) {
    return <></>;
  }

  return (
    <Config.Provider value={{ isPoppedOut, matchers, storage, updateMatchers }}>
      {children}
    </Config.Provider>
  );
}
