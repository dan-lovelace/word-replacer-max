import {
  CacheStorage,
  StorageCache,
  StorageCacheConfig,
} from "./replacer-storage";

/**
 * Configuration options for the Replacer class
 */
interface ReplacerOptions {
  ignoreElements?: string[];
  startNode?: HTMLElement;
  storageConfig?: StorageCacheConfig;
}

/**
 * Represents a text replacement operation
 */
interface ReplacementOperation {
  original: string;
  replacement: string;
  timestamp: number;
}

export class Replacer {
  private readonly ignoreElements: Set<string>;
  private readonly mutationMap: WeakMap<HTMLElement, MutationRecord>;
  private readonly startNode: HTMLElement;
  private readonly storageCache: StorageCache;

  private isProcessingStorage: boolean;
  private pendingReplacements: Map<string, ReplacementOperation>;
  private storage: CacheStorage;

  constructor(options: ReplacerOptions = {}) {
    const {
      ignoreElements = ["input", "script", "style", "textarea"],
      startNode = document.documentElement,
      storageConfig = {},
    } = options;

    this.ignoreElements = new Set(ignoreElements);
    this.isProcessingStorage = false;
    this.mutationMap = new WeakMap();
    this.pendingReplacements = new Map();
    this.startNode = startNode;
    this.storage = {
      sync: {},
    };
    this.storageCache = new StorageCache(storageConfig);

    this.init();
  }

  /**
   * Initializes the replacer by performing initial replacements and setting up observers
   * @private
   */
  private async init(): Promise<void> {
    await this.updateStorageFromCache();

    if (!this.storage.sync.preferences?.extensionEnabled) {
      /**
       * The extension is disabled, do not continue
       */
      return;
    }

    await this.replaceAll();
    this.listenForChanges();
  }

  /**
   * Handles DOM mutations
   * @param mutations - Array of MutationRecord objects
   * @private
   */
  private async handleMutations(mutations: MutationRecord[]): Promise<void> {
    if (mutations.length === 0) return;

    await this.updateStorageFromCache();
    const processedNodes = new Set<Node>();

    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        this.processTextNode(mutation.target as Text, processedNodes);
      } else {
        this.processAddedNodes(Array.from(mutation.addedNodes), processedNodes);
      }
    }
  }

  /**
   * Determines if a mutation is relevant for text replacement
   * @param mutation - The MutationRecord to check
   * @private
   */
  private isRelevantMutation(mutation: MutationRecord): boolean {
    if (mutation.type === "characterData") return true;

    return Array.from(mutation.addedNodes).some(
      (node) =>
        node.nodeType === Node.TEXT_NODE ||
        (node.nodeType === Node.ELEMENT_NODE && node.hasChildNodes())
    );
  }

  /**
   * Sets up a MutationObserver to watch for DOM changes
   * @private
   */
  private listenForChanges(): void {
    const observer = new MutationObserver((mutations) => {
      const textMutations = mutations.filter((mutation) =>
        this.isRelevantMutation(mutation)
      );

      this.handleMutations(textMutations);
    });

    observer.observe(this.startNode, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  /**
   * Processes newly added nodes for text replacement
   * @param nodes - Array of nodes to process
   * @param processedNodes - Set of already processed nodes
   * @private
   */
  private processAddedNodes(nodes: Node[], processedNodes: Set<Node>): void {
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        this.processTextNode(node as Text, processedNodes);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        this.walkTextNodes(node as HTMLElement, processedNodes);
      }
    }
  }

  /**
   * Processes text nodes for replacement
   * @param textNode - The text node to process
   * @param processedNodes - Set of already processed nodes
   * @private
   */
  private async processTextNode(
    textNode: Text,
    processedNodes: Set<Node>
  ): Promise<void> {
    if (processedNodes.has(textNode)) return;

    const parentElement = textNode.parentElement;
    if (!parentElement || this.shouldIgnoreElement(parentElement)) return;

    // Ensure we have the latest storage before processing
    await this.updateStorageFromCache();

    const {
      sync: { preferences },
    } = this.storage;

    if (!preferences?.extensionEnabled) {
      return;
    }

    // Perform text replacement logic here

    processedNodes.add(textNode);
  }

  /**
   * Checks if an element should be ignored for text replacement
   * @param element - The element to check
   * @private
   */
  private shouldIgnoreElement(element: HTMLElement): boolean {
    return (
      this.ignoreElements.has(element.tagName.toLowerCase()) ||
      element.getAttribute("data-no-replace") === "true"
    );
  }

  /**
   * Updates the internal storage from cache
   * @private
   */
  private async updateStorageFromCache(): Promise<void> {
    if (this.isProcessingStorage) return;

    try {
      this.isProcessingStorage = true;
      this.storage = await this.storageCache.getStorage();
    } finally {
      this.isProcessingStorage = false;
    }
  }

  /**
   * Recursively walks through text nodes in an element
   * @param element - The element to walk through
   * @param processedNodes - Set of already processed nodes
   * @private
   */
  private walkTextNodes(element: HTMLElement, processedNodes: Set<Node>): void {
    if (this.shouldIgnoreElement(element)) return;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Text | null;
    while ((node = walker.nextNode() as Text)) {
      this.processTextNode(node, processedNodes);
    }
  }

  /**
   * Performs an initial replacement on the entire start node
   * @public
   */
  public async replaceAll(): Promise<void> {
    await this.updateStorageFromCache();

    const processedNodes = new Set<Node>();

    this.walkTextNodes(this.startNode, processedNodes);
  }

  /**
   * Updates the storage with new values
   * @param newStorage - Partial storage object with updates
   * @public
   */
  public updateStorage(newStorage: StorageCache): void {
    this.storage = {
      ...this.storage,
      ...newStorage,
    };
  }
}
