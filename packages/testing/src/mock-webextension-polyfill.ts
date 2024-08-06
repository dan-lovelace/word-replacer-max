import { Browser, Events, Storage } from "webextension-polyfill";

type TBrowser = Omit<Browser, "runtime" | "storage"> & {
  runtime: TRuntime | undefined;
  storage: TStorage | undefined;
};

type TRuntime = Partial<Browser["runtime"]>;

type TStorage = Partial<Browser["storage"]>;

type Key<T> = keyof T;

type KeyMap<T> = Partial<{
  [key in Key<T>]: T[key];
}>;

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

class MockStorage<T>
  implements Partial<Omit<Browser["storage"], "local" | "managed" | "session">>
{
  private _onChanged: Events.Event<ListenerCallback> = {
    addListener: (callback: ListenerCallback) => this.listeners.add(callback),
    hasListener: (callback: ListenerCallback) => this.listeners.has(callback),
    hasListeners: () => this.listeners.size > 0,
    removeListener: (callback: ListenerCallback) =>
      this.listeners.delete(callback),
  };

  listeners: Set<ListenerCallback> = new Set();

  onChanged = this._onChanged;

  store: KeyMap<T> = {};

  sync?: Storage.SyncStorageAreaSync;

  constructor(initialValues?: T) {
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
      get: (keys) => {
        return new Promise((resolve) => {
          const currentStore = deepClone(this.store);
          const result: Record<any, any> = {};

          if (Array.isArray(keys)) {
            keys.forEach((key: Key<T>) => {
              result[key] = currentStore[key];
            });
          } else if (keys && typeof keys === "object") {
            (Object.keys(keys) as Key<T>[]).forEach((key) => {
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
              delete newStore[key as Key<T>];
            });
          } else {
            delete newStore[keys as Key<T>];
          }

          this.store = newStore;

          Array.from(this.listeners).forEach((listener) => {
            listener({});
          });

          resolve();
        });
      },
      set: (items: KeyMap<T>) => {
        return new Promise((resolve) => {
          const newStore = deepClone(this.store);
          let isDifferent = false;

          (Object.keys(items) as Key<T>[]).forEach((key) => {
            newStore[key] = items[key];

            isDifferent =
              isDifferent === true ||
              !deepEqual(this.store[key], newStore[key]);
          });

          this.store = newStore;

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

class MockBrowser<StorageType> implements Partial<TBrowser> {
  runtime: TRuntime | undefined;

  storage: TStorage | undefined;

  constructor({
    runtime,
    withStorage,
  }: {
    runtime?: TRuntime;
    withStorage?: StorageType;
  }) {
    this.runtime = runtime ?? {
      getURL: (path: string) => `mocked_url/${path}`,
    };

    const mockStorage = new MockStorage(withStorage);
    this.storage = mockStorage;
  }
}

export { MockBrowser as default };
