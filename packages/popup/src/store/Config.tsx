import { VNode, createContext } from "preact";
import { useEffect, useState } from "preact/hooks";

import { browser, storageGetByKeys } from "@worm/shared";
import { Storage } from "@worm/types";

type ConfigType = {
  storage: Storage;
};

const defaultConfig = {
  storage: {
    domainList: [],
    matchers: [],
  },
};

export const Config = createContext<ConfigType>(defaultConfig);

export function ConfigProvider({ children }: { children: VNode }) {
  const [initialized, setInitialized] = useState(false);
  const [storage, setStorage] = useState<Storage>(defaultConfig.storage);

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

  return <Config.Provider value={{ storage }}>{children}</Config.Provider>;
}
