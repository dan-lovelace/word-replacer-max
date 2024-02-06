import { VNode, createContext } from "preact";
import { StateUpdater, useEffect, useState } from "preact/hooks";
import Browser from "webextension-polyfill";

import { storageGetByKeys } from "@worm/shared";
import { Matcher, Storage } from "@worm/types";

type ConfigType = {
  storage: Storage;
};

const defaultConfig = {
  storage: {
    domainBlocklist: [],
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

    Browser.storage.onChanged.addListener(updateStorage);

    return () => {
      Browser.storage.onChanged.removeListener(updateStorage);
    };
  }, []);

  if (!initialized) {
    return <></>;
  }

  return <Config.Provider value={{ storage }}>{children}</Config.Provider>;
}
