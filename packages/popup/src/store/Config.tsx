import { VNode, createContext } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

import { browser, storageGetByKeys } from "@worm/shared";
import { Storage } from "@worm/types";

import { POPPED_OUT_PARAMETER_KEY } from "../lib/config";

type ConfigType = {
  isPoppedOut: boolean;
  storage: Storage;
};

const defaultConfig: ConfigType = {
  isPoppedOut: false,
  storage: {
    domainList: [],
    matchers: [],
  },
};

export const Config = createContext<ConfigType>(defaultConfig);

export function ConfigProvider({ children }: { children: VNode }) {
  const [initialized, setInitialized] = useState(false);
  const [storage, setStorage] = useState<Storage>(defaultConfig.storage);

  const isPoppedOut = useMemo(
    () =>
      new URLSearchParams(window.location.search).get(
        POPPED_OUT_PARAMETER_KEY
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
