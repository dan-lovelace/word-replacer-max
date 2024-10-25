import { createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import {
  browser,
  POPUP_POPPED_OUT_PARAMETER_KEY,
} from "@worm/shared/src/browser";
import { getStorageProvider, storageGetByKeys } from "@worm/shared/src/storage";
import { SessionStorage, Storage } from "@worm/types";

import { PreactChildren } from "../lib/types";

type ConfigStore = {
  isPoppedOut: boolean;
  sessionStorage: SessionStorage;
  storage: Storage;
};

const storeDefaults: ConfigStore = {
  isPoppedOut: false,
  sessionStorage: {
    authAccessToken: undefined,
    authClockDrift: undefined,
    authIdToken: undefined,
    authLastAuthUser: undefined,
    authRefreshToken: undefined,
  },
  storage: {
    domainList: [],
    matchers: [],
  },
};

const Config = createContext<ConfigStore>(storeDefaults);

export const useConfig = () => useContext(Config);

export function ConfigProvider({ children }: { children: PreactChildren }) {
  const [initialized, setInitialized] = useState(false);
  const [sessionStorage, setSessionStorage] = useState<SessionStorage>(
    storeDefaults.sessionStorage
  );
  const [storage, setStorage] = useState<Storage>(storeDefaults.storage);

  const isPoppedOut = useMemo(
    () =>
      new URLSearchParams(window.location.search).get(
        POPUP_POPPED_OUT_PARAMETER_KEY
      ) === "true",
    []
  );

  useEffect(() => {
    const updateStorage = async () => {
      setSessionStorage(
        (await getStorageProvider("session").get()) as SessionStorage
      );
      setStorage(await storageGetByKeys());
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
    <Config.Provider value={{ isPoppedOut, sessionStorage, storage }}>
      {children}
    </Config.Provider>
  );
}
