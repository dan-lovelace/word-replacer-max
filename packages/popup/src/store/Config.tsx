import { VNode, createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import {
  browser,
  POPUP_POPPED_OUT_PARAMETER_KEY,
  storageGetByKeys,
} from "@worm/shared";
import { Storage } from "@worm/types";

type ConfigStore = {
  isPoppedOut: boolean;
  storage: Storage;
};

const storeDefaults: ConfigStore = {
  isPoppedOut: false,
  storage: {
    domainList: [],
    matchers: [],
  },
};

const Config = createContext<ConfigStore>(storeDefaults);

export const useConfig = () => useContext(Config);

export function ConfigProvider({ children }: { children: VNode }) {
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
    const updateStorage = async () => {
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
    <Config.Provider value={{ isPoppedOut, storage }}>
      {children}
    </Config.Provider>
  );
}
