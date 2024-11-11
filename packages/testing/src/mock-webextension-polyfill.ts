import {
  Browser,
  Events,
  Runtime,
  Storage,
  Windows,
} from "webextension-polyfill";

type TBrowser = Omit<Browser, "runtime" | "storage" | "windows"> & {
  runtime: TRuntime;
  storage: TStorage;
  windows: TWindows;
};

type TRuntime = Partial<Browser["runtime"]> & {
  connect: (connectInfo?: TRuntimeConnectInfo) => Runtime.Port;
  onConnect: TRuntimeConnectEvent;
  onMessage: TRuntimeMessageEvent;
};

type TRuntimeConnectEvent = Events.Event<(port: Runtime.Port) => void>;

type TRuntimeConnectInfo = {
  name?: string;
};

type TRuntimeMessageEvent = Events.Event<TRuntimeMessageEventCallback>;

type TRuntimeMessageEventCallback = (
  message: any,
  sender: Runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void | true;

type TStorage = Partial<Browser["storage"]>;

type TStorageArea = keyof Pick<TStorage, "local" | "session" | "sync">;

type TStorageInitialValues<T> = Partial<Record<TStorageArea, T>>;

type TWindows = Partial<Browser["windows"]>;

type Key<T> = keyof T;

type KeyMap<T> = Partial<{
  [key in Key<T>]: T[key];
}>;

type ListenerCallback = (
  changes: Storage.StorageAreaSyncOnChangedChangesType,
  areaName: TStorageArea
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

class MockPort implements Runtime.Port {
  name: string;

  private connected: boolean;

  private disconnectListeners: Set<(port: Runtime.Port) => void>;

  private listeners: Set<(message: any, port: Runtime.Port) => void>;

  constructor(name: string = "") {
    this.name = name;
    this.connected = true;
    this.disconnectListeners = new Set();
    this.listeners = new Set();
  }

  disconnect() {
    this.connected = false;
    this.disconnectListeners.forEach((listener) => listener(this));
  }

  postMessage(message: any) {
    if (!this.connected) return;

    this.listeners.forEach((listener) => listener(message, this));
  }

  get onMessage(): Events.Event<(message: any, port: Runtime.Port) => void> {
    return {
      addListener: (callback: (message: any, port: Runtime.Port) => void) => {
        this.listeners.add(callback);
      },
      hasListener: (callback: (message: any, port: Runtime.Port) => void) => {
        return this.listeners.has(callback);
      },
      hasListeners: () => this.listeners.size > 0,
      removeListener: (
        callback: (message: any, port: Runtime.Port) => void
      ) => {
        this.listeners.delete(callback);
      },
    };
  }

  get onDisconnect(): TRuntimeConnectEvent {
    return {
      addListener: (callback: (port: Runtime.Port) => void) => {
        this.disconnectListeners.add(callback);
      },
      hasListener: (callback: (port: Runtime.Port) => void) => {
        return this.disconnectListeners.has(callback);
      },
      hasListeners: () => this.disconnectListeners.size > 0,
      removeListener: (callback: (port: Runtime.Port) => void) => {
        this.disconnectListeners.delete(callback);
      },
    };
  }
}

class MockRuntime implements TRuntime {
  private connectListeners: Set<(port: Runtime.Port) => void>;

  private messageListeners: Set<
    (
      message: any,
      sender: Runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => void | boolean
  >;

  constructor() {
    this.connectListeners = new Set();
    this.messageListeners = new Set();
  }

  getURL(path: string) {
    return `/${path}`;
  }

  connect(connectInfo?: TRuntimeConnectInfo): Runtime.Port {
    const port = new MockPort(connectInfo?.name);

    this.connectListeners.forEach((listener) => listener(port));

    return port;
  }

  get onConnect(): TRuntimeConnectEvent {
    return {
      addListener: (callback: (port: Runtime.Port) => void) => {
        this.connectListeners.add(callback);
      },
      hasListener: (callback: (port: Runtime.Port) => void) => {
        return this.connectListeners.has(callback);
      },
      hasListeners: () => this.connectListeners.size > 0,
      removeListener: (callback: (port: Runtime.Port) => void) => {
        this.connectListeners.delete(callback);
      },
    };
  }

  get onMessage(): TRuntimeMessageEvent {
    return {
      addListener: (callback: TRuntimeMessageEventCallback) => {
        this.messageListeners.add(callback);
      },
      hasListener: (callback: TRuntimeMessageEventCallback) => {
        return this.messageListeners.has(callback);
      },
      hasListeners: () => this.messageListeners.size > 0,
      removeListener: (callback: TRuntimeMessageEventCallback) => {
        this.messageListeners.delete(callback);
      },
    };
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
          const oldValues = { ...this._store[area] };
          this._store[area] = {};

          const changes: Record<string, Storage.StorageChange> = {};
          Object.keys(oldValues).forEach((key) => {
            changes[key] = {
              oldValue: oldValues[key as keyof typeof oldValues],
            };
          });

          if (Object.keys(changes).length > 0) {
            Array.from(this._listeners).forEach((listener) => {
              listener(changes, area);
            });
          }

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
          const changes: Record<string, Storage.StorageChange> = {};
          const newStore = deepClone(this._store[area]);

          if (Array.isArray(keys)) {
            keys.forEach((key) => {
              if (newStore[key as Key<T>] !== undefined) {
                changes[key] = { oldValue: newStore[key as Key<T>] };
                delete newStore[key as Key<T>];
              }
            });
          } else {
            const key = keys as Key<T>;

            if (newStore[key] !== undefined) {
              changes[key as string] = { oldValue: newStore[key] };
              delete newStore[key];
            }
          }

          this._store[area] = newStore;

          if (Object.keys(changes).length > 0) {
            Array.from(this._listeners).forEach((listener) => {
              listener(changes, area);
            });
          }

          resolve();
        });
      },
      set: (items: KeyMap<T>) => {
        return new Promise((resolve) => {
          const changes: Record<string, { newValue: any; oldValue?: any }> = {};
          const newStore = deepClone(this._store[area]);

          (Object.keys(items) as Key<T>[]).forEach((key) => {
            const newValue = items[key];
            const oldValue = newStore[key];

            if (!deepEqual(oldValue, newValue)) {
              changes[key as string] = {
                newValue,
                oldValue,
              };

              newStore[key] = newValue;
            }
          });

          this._store[area] = newStore;

          if (Object.keys(changes).length > 0) {
            Array.from(this._listeners).forEach((listener) => {
              listener(changes, area);
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
