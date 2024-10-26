import { Browser, Events, Storage, Windows } from "webextension-polyfill";

type TBrowser = Omit<Browser, "runtime" | "storage" | "windows"> & {
  runtime: TRuntime;
  storage: TStorage;
  windows: TWindows;
};

type TRuntime = Partial<Browser["runtime"]>;

type TStorage = Partial<Browser["storage"]>;

type TStorageArea = keyof Pick<TStorage, "local" | "session" | "sync">;

type TStorageInitialValues<T> = Partial<Record<TStorageArea, T>>;

type TWindows = Partial<Browser["windows"]>;

type Key<T> = keyof T;

type KeyMap<T> = Partial<{
  [key in Key<T>]: T[key];
}>;

type ListenerCallback = (
  changes: Storage.StorageAreaSyncOnChangedChangesType
) => void;

type MockBrowserProps<T> = {
  withStorage?: TStorageInitialValues<T>;
};

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

class MockBrowser<T> implements Partial<TBrowser> {
  runtime: TRuntime;

  storage: TStorage;

  windows: TWindows;

  constructor({ withStorage }: MockBrowserProps<T>) {
    this.runtime = new MockRuntime();

    const mockStorage = new MockStorage(withStorage);
    this.storage = mockStorage;

    const mockWindows = new MockWindows();
    this.windows = mockWindows;
  }
}

class MockRuntime implements TRuntime {
  getURL(path: string) {
    return `/${path}`;
  }
}

class MockStorage<T> implements TStorage {
  _onChanged: Events.Event<ListenerCallback> = {
    addListener: (callback: ListenerCallback) => this._listeners.add(callback),
    hasListener: (callback: ListenerCallback) => this._listeners.has(callback),
    hasListeners: () => this._listeners.size > 0,
    removeListener: (callback: ListenerCallback) =>
      this._listeners.delete(callback),
  };

  _listeners: Set<ListenerCallback> = new Set();

  _store: Record<TStorageArea, KeyMap<T>> = {
    local: {},
    session: {},
    sync: {},
  };

  onChanged? = this._onChanged;

  local?: Storage.LocalStorageArea;
  session?: Storage.StorageArea;
  sync?: Storage.SyncStorageAreaSync;

  constructor(initialValues?: TStorageInitialValues<T>) {
    if (initialValues !== undefined) {
      this._store.local = initialValues.local ?? {};
      this._store.session = initialValues.session ?? {};
      this._store.sync = initialValues.sync ?? {};
    }

    this.local = this.getStorageArea("local");

    this.session = this.getStorageArea("session");

    this.sync = this.getStorageArea("sync");
  }

  getStorageArea(area: "local"): Storage.LocalStorageArea;

  getStorageArea(area: "session"): Storage.StorageArea;

  getStorageArea(area: "sync"): Storage.SyncStorageAreaSync;

  getStorageArea(area: TStorageArea) {
    const baseProps = this.getStorageAreaBase(area);

    switch (area) {
      case "local": {
        const localArea: Storage.LocalStorageArea = {
          QUOTA_BYTES: 5242880,
          ...baseProps,
        };

        return localArea;
      }

      case "session": {
        const sessionArea: Storage.StorageArea = {
          ...baseProps,
        };

        return sessionArea;
      }

      case "sync": {
        const syncArea: Storage.SyncStorageAreaSync = {
          MAX_ITEMS: 512,
          MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
          MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
          QUOTA_BYTES: 102400,
          QUOTA_BYTES_PER_ITEM: 8192,
          getBytesInUse: async () => 100,
          ...baseProps,
        };

        return syncArea;
      }

      default:
        throw new Error(`Invalid area provided: ${area}`);
    }
  }

  /**
   * Common properties that belong to all supported storage areas.
   */
  private getStorageAreaBase(area: TStorageArea): Storage.StorageArea {
    return {
      onChanged: this._onChanged,

      clear: () => {
        return new Promise((resolve) => {
          this._store[area] = {};

          resolve();
        });
      },
      get: (keys) => {
        return new Promise((resolve) => {
          const currentStore = deepClone(this._store[area]);
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
      remove: (keys) => {
        return new Promise((resolve) => {
          const newStore = deepClone(this._store[area]);

          if (Array.isArray(keys)) {
            keys.forEach((key) => {
              delete newStore[key as Key<T>];
            });
          } else {
            delete newStore[keys as Key<T>];
          }

          this._store[area] = newStore;

          Array.from(this._listeners).forEach((listener) => {
            listener({});
          });

          resolve();
        });
      },
      set: (items: KeyMap<T>) => {
        return new Promise((resolve) => {
          const newStore = deepClone(this._store[area]);
          let isDifferent = false;

          (Object.keys(items) as Key<T>[]).forEach((key) => {
            newStore[key] = items[key];

            isDifferent =
              isDifferent === true ||
              !deepEqual(this._store[area][key], newStore[key]);
          });

          this._store[area] = newStore;

          if (isDifferent) {
            Array.from(this._listeners).forEach((listener) => {
              listener({});
            });
          }

          resolve();
        });
      },
    };
  }
}

class MockWindows implements TWindows {
  create(createData?: Windows.CreateCreateDataType) {
    return new Promise<Windows.Window>((resolve) => {
      const createParams = new URLSearchParams(Object(createData));
      const queryString = createParams.toString();

      window.open(String(createData?.url), "", queryString);

      resolve({
        alwaysOnTop: false,
        focused: true,
        incognito: false,
      });
    });
  }
}

export { MockBrowser as default };
