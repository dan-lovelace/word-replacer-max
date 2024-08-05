import { Browser, Events, Storage } from "webextension-polyfill";

import { DeepPartial, StorageKey, Storage as WRMStorage } from "@worm/types";

type ListenerCallback = (
  changes: Storage.StorageAreaSyncOnChangedChangesType
) => void;

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrCopy: any[] = [];

    for (const item of obj) {
      arrCopy.push(deepClone(item));
    }

    return arrCopy as unknown as T;
  }

  const objCopy: { [key: string]: any } = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepClone(obj[key]);
    }
  }

  return objCopy as T;
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

class DevStorage
  implements Partial<Omit<Browser["storage"], "local" | "managed" | "session">>
{
  _onChanged: Events.Event<ListenerCallback> = {
    addListener: (callback: ListenerCallback) => this.listeners.add(callback),
    hasListener: (callback: ListenerCallback) => this.listeners.has(callback),
    hasListeners: () => this.listeners.size > 0,
    removeListener: (callback: ListenerCallback) =>
      this.listeners.delete(callback),
  };

  listeners: Set<ListenerCallback> = new Set();

  onChanged = this._onChanged;

  store: Partial<WRMStorage> = {
    domainList: [],
    matchers: [
      {
        active: true,
        identifier: "1234",
        queries: ["my jaw dropped", "I was shocked"],
        queryPatterns: [],
        replacement: "I was surprised",
      },
      {
        active: true,
        identifier: "5678",
        queries: ["This."],
        queryPatterns: ["case", "wholeWord"],
        replacement: " ",
      },
    ],
    preferences: {
      activeTab: "rules",
      domainListEffect: "deny",
      extensionEnabled: true,
      focusRule: "",
    },
  };

  sync: Storage.SyncStorageAreaSync;

  constructor(initialValues?: WRMStorage) {
    if (initialValues !== undefined) {
      this.store = initialValues;
    }

    this.sync = {
      MAX_ITEMS: 512,
      MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
      MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
      QUOTA_BYTES: 102400,
      QUOTA_BYTES_PER_ITEM: 8192,

      clear: () =>
        new Promise((resolve) => {
          this.store = {};

          resolve();
        }),
      getBytesInUse: async () => 100,
      get: (keys: StorageKey) => {
        return new Promise((resolve) => {
          const currentStore = deepClone(this.store);
          const result: Record<any, any> = {};

          if (Array.isArray(keys)) {
            keys.forEach((key: StorageKey) => {
              result[key] = currentStore[key];
            });
          } else if (typeof keys === "object") {
            (Object.keys(keys) as StorageKey[]).forEach((key) => {
              result[key] = currentStore[key];
            });
          } else {
            return resolve(currentStore);
          }

          resolve(result);
        });
      },
      onChanged: this._onChanged,
      remove: (keys) => {
        return new Promise((resolve) => {
          const newStore = deepClone(this.store);

          if (Array.isArray(keys)) {
            keys.forEach((key) => {
              delete newStore[key as StorageKey];
            });
          } else {
            delete newStore[keys as StorageKey];
          }

          this.store = deepClone(newStore);

          Array.from(this.listeners).forEach((listener) => {
            listener({});
          });

          resolve();
        });
      },
      set: (items) => {
        return new Promise((resolve) => {
          const changes: Record<string, any> = {};
          let isDifferent = false;
          const newStore = deepClone(this.store);

          (Object.keys(items) as StorageKey[]).forEach((key) => {
            changes[key] = { oldValue: newStore[key], newValue: items[key] };
            newStore[key] = deepClone(items[key]);

            if (!deepEqual(changes[key].oldValue, changes[key].newValue)) {
              isDifferent = true;
            }
          });

          this.store = deepClone(newStore);

          if (isDifferent) {
            Array.from(this.listeners).forEach((listener) => {
              listener({});
            });
          }

          resolve();
        });
      },
    };
  }
}

const _default: DeepPartial<Browser> = {
  runtime: {
    getURL: (path: string) => `mocked_url/${path}`,
  },
  storage: new DevStorage(),
};

export { _default as default };
