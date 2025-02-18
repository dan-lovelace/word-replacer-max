import { RuntimeMessage, RuntimeMessageKind } from "@worm/types/src/message";
import { Storage } from "@worm/types/src/storage";

import { createRuntimeMessage } from "../messaging";

import { browser } from "./browser";

/**
 * Cache status for storage values
 */
interface CacheStatus {
  isProcessing: boolean;
  timestamp: number;
}

/**
 * Configuration for the storage cache
 */
export interface StorageCacheConfig {
  backgroundPort?: browser.Runtime.Port;
  ttlMs?: number;
}

export type CacheStorage = Pick<Storage, "sync">;

/**
 * Manages cached storage access with background script communication
 */
export class StorageCache {
  private readonly ttlMs: number;

  private backgroundPort: browser.Runtime.Port | null;
  private cache: CacheStorage;
  private cacheStatus: CacheStatus;
  private updatePromise: Promise<void> | null;

  constructor(config: StorageCacheConfig = {}) {
    const { backgroundPort = null, ttlMs = 10 } = config;

    this.cache = {
      sync: {},
    };

    this.cacheStatus = {
      timestamp: 0,
      isProcessing: false,
    };

    this.backgroundPort = backgroundPort;
    this.ttlMs = ttlMs;
    this.updatePromise = null;

    this.init();
  }

  /**
   * Processes messages from the background script
   * @param message - Message received from the background script
   * @private
   */
  private handleBackgroundMessage(message: any): void {
    const event = message as RuntimeMessage<RuntimeMessageKind>;

    if (event.data.kind === "replacerStorageResponse") {
      const storageData = event.data.details?.data as CacheStorage;

      this.cache = storageData;
      this.cacheStatus.timestamp = Date.now();
    }
  }

  private init(): void {
    if (this.backgroundPort) {
      this.backgroundPort.onMessage.addListener(
        this.handleBackgroundMessage.bind(this)
      );
    }
  }

  /**
   * Updates storage directly if no background script is available
   * @private
   */
  private async updateStorageDirectly(): Promise<void> {
    try {
      const [sync] = await Promise.all([browser.storage.sync.get()]);

      this.cache = {
        sync,
      };

      this.cacheStatus.timestamp = Date.now();
    } finally {
      this.cacheStatus.isProcessing = false;
      this.updatePromise = null;
    }
  }

  /**
   * Attempts to update storage using the background script
   * @private
   */
  private async updateStorageFromBackground(): Promise<void> {
    if (!this.backgroundPort) {
      throw new Error("Background port not available");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Storage update timeout"));
      }, 5000); // 5 second timeout

      const messageHandler = (message: any) => {
        const event = message as RuntimeMessage<RuntimeMessageKind>;

        if (event.data.kind === "replacerStorageResponse") {
          this.backgroundPort?.onMessage.removeListener(messageHandler);
          clearTimeout(timeout);

          const storageData = event.data.details?.data as CacheStorage;
          this.cache = storageData;
          this.cacheStatus.timestamp = Date.now();
          this.cacheStatus.isProcessing = false;
          this.updatePromise = null;

          resolve();
        }
      };

      this.backgroundPort?.onMessage.addListener(messageHandler);

      const runtimeMessage = createRuntimeMessage("replacerStorageRequest");
      this.backgroundPort?.postMessage({ data: runtimeMessage });
    });
  }

  /**
   * Forces an immediate cache refresh
   */
  public async forceRefresh(): Promise<void> {
    this.cacheStatus.timestamp = 0;

    await this.getStorage();
  }

  /**
   * Gets the current storage state, refreshing from background if needed
   */
  public async getStorage(): Promise<CacheStorage> {
    const now = Date.now();

    // If we're already processing an update, wait for it
    if (this.cacheStatus.isProcessing && this.updatePromise) {
      await this.updatePromise;
      return this.cache;
    }

    // Check if cache is still valid
    if (now - this.cacheStatus.timestamp <= this.ttlMs) {
      return this.cache;
    }

    // Cache expired, need to refresh
    this.cacheStatus.isProcessing = true;
    this.updatePromise = this.backgroundPort
      ? this.updateStorageFromBackground()
      : this.updateStorageDirectly();

    await this.updatePromise;
    return this.cache;
  }
}
