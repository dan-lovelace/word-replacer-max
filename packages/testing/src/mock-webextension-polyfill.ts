import { Browser, Events, Storage, Windows } from "webextension-polyfill";

type TBrowser = Omit<Browser, "runtime" | "storage" | "windows"> & {
  runtime: TRuntime;
  storage: TStorage;
  windows: TWindows;
};

type TRuntime = Partial<Browser["runtime"]>;

type TStorage = Partial<Browser["storage"]>;

type TWindows = Partial<Browser["windows"]>;

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

class MockBrowser<StorageType> implements Partial<TBrowser> {
  runtime: TRuntime;

  storage: TStorage;

  windows: TWindows;

  constructor({ withStorage }: { withStorage?: StorageType }) {
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

  _store: KeyMap<T> = {};

  onChanged? = this._onChanged;

  sync?: Storage.SyncStorageAreaSync;

  constructor(initialValues?: T) {
    if (initialValues !== undefined) {
      this._store = initialValues;
    }

    this.sync = {
      MAX_ITEMS: 512,
      MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
      MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
      QUOTA_BYTES: 102400,
      QUOTA_BYTES_PER_ITEM: 8192,

      clear: () =>
        new Promise((resolve) => {
          this._store = {};

          resolve();
        }),
      getBytesInUse: async () => 100,
      get: (keys) => {
        return new Promise((resolve) => {
          const currentStore = deepClone(this._store);
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
          const newStore = deepClone(this._store);

          if (Array.isArray(keys)) {
            keys.forEach((key) => {
              delete newStore[key as Key<T>];
            });
          } else {
            delete newStore[keys as Key<T>];
          }

          this._store = newStore;

          Array.from(this._listeners).forEach((listener) => {
            listener({});
          });

          resolve();
        });
      },
      set: (items: KeyMap<T>) => {
        return new Promise((resolve) => {
          const newStore = deepClone(this._store);
          let isDifferent = false;

          (Object.keys(items) as Key<T>[]).forEach((key) => {
            newStore[key] = items[key];

            isDifferent =
              isDifferent === true ||
              !deepEqual(this._store[key], newStore[key]);
          });

          this._store = newStore;

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
