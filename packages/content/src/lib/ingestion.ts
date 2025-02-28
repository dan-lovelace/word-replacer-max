import { z } from "zod";

import { browser, sendConnectMessage } from "@worm/shared/src/browser";
import {
  ErrorableMessage,
  HTMLReplaceResponse,
  HTMLStringItem,
  WebAppMessage,
  WebAppMessageData,
  WebAppMessageKind,
} from "@worm/types/src/message";
import { ExportLink } from "@worm/types/src/popup";
import {
  ReplacementStyle,
  ReplacementStyleOption,
  ReplacementSuggest,
  RuleGroups,
} from "@worm/types/src/replace";
import {
  FocusRule,
  StorageArea,
  StorageVersion,
  SyncStorageNew,
  SyncStoragePreferences,
} from "@worm/types/src/storage";

interface IngestionEngineConfig {
  ignoreElements?: Set<string>;
  startNode?: HTMLElement;
}

interface CacheStatus {
  isProcessing: boolean;
  timestamp: number;
}

type CacheStorage = Awaited<ReturnType<StorageArea["get"]>>;

type IngestionStorage = Partial<SyncStorageNew>;

const ExportLinkSchema: z.ZodType<ExportLink> = z.object({
  identifier: z.number(),
  url: z.string(),
});

const FocusRuleSchema: z.ZodType<FocusRule> = z.object({
  field: z.union([z.literal("queries"), z.literal("replacement")]),
  matcher: z.string(),
});

const PreferencesSchema: z.ZodType<SyncStoragePreferences> = z.object({
  activeTab: z.union([
    z.literal("account"),
    z.literal("domains"),
    z.literal("options"),
    z.literal("rules"),
    z.literal("support"),
  ]),
  domainListEffect: z.union([z.literal("allow"), z.literal("deny")]),
  extensionEnabled: z.boolean(),
  focusRule: FocusRuleSchema,
});

const ReplacementStyleOptionSchema: z.ZodType<ReplacementStyleOption> = z.union(
  [
    z.literal("backgroundColor"),
    z.literal("bold"),
    z.literal("color"),
    z.literal("italic"),
    z.literal("strikethrough"),
    z.literal("underline"),
  ]
);

const ReplacementStyleSchema: z.ZodType<ReplacementStyle> = z.object({
  active: z.boolean(),
  backgroundColor: z.string(),
  color: z.string(),
  options: z.array(ReplacementStyleOptionSchema),
});

const ReplacementSuggestSchema: z.ZodType<ReplacementSuggest> = z.object({
  active: z.boolean(),
});

const RuleGroupsSchema: z.ZodType<RuleGroups> = z.object({
  active: z.boolean(),
});

const StorageVersionSchema: z.ZodType<StorageVersion> = z.union([
  z.literal("1.0.0"),
  z.literal("1.1.0"),
  z.literal("1.1.1"),
  z.literal("1.2.0"),
]);

const SyncStorageSchema: z.ZodType<SyncStorageNew> = z.object({
  domainList: z.array(z.string()),
  exportLinks: z.array(ExportLinkSchema),
  preferences: PreferencesSchema,
  replacementStyle: ReplacementStyleSchema,
  replacementSuggest: ReplacementSuggestSchema,
  ruleGroups: RuleGroupsSchema,
  storageVersion: StorageVersionSchema,
});

export interface IngestionEngineStorageConfig {
  area: StorageArea;
  ttlMs?: number;
}

class IngestionEngineStorage {
  private readonly ttlMs: number;

  private updatePromise: Promise<void> | null;
  private cache: IngestionStorage;
  private cacheStatus: CacheStatus;
  private area: StorageArea;

  constructor(config: IngestionEngineStorageConfig) {
    const { area, ttlMs = 20 } = config;

    this.cache = {};

    this.cacheStatus = {
      isProcessing: false,
      timestamp: 0,
    };

    this.area = area;
    this.ttlMs = ttlMs;
    this.updatePromise = null;
  }

  private async updateStorage(): Promise<void> {
    const currentStorage = await this.area.get();
    const parseResult = SyncStorageSchema.safeParse(currentStorage);

    if (parseResult.error) {
      throw new Error("Error parsing current storage");
    }

    this.cache = parseResult.data;
  }

  public async getStorage(): Promise<IngestionStorage> {
    const now = Date.now();

    if (this.cacheStatus.isProcessing || this.updatePromise) {
      await this.updatePromise;
      return this.cache;
    }

    if (now - this.cacheStatus.timestamp <= this.ttlMs) {
      return this.cache;
    }

    this.cacheStatus.isProcessing = true;
    this.updatePromise = this.updateStorage();

    await this.updatePromise;
    return this.cache;
  }
}

export class IngestionEngine {
  private readonly ignoreElements: Set<string>;
  private readonly startNode: HTMLElement;

  private batchContents: HTMLStringItem[] = [];
  private batchSize = 50;
  private isProcessingBatch = false;
  private isProcessingStorage = false;
  private store: IngestionStorage;
  private storageProvider: IngestionEngineStorage;

  constructor(options: IngestionEngineConfig = {}) {
    const {
      ignoreElements = ["input", "script", "style", "textarea"],
      startNode = document.documentElement,
    } = options;

    this.store = {};

    this.storageProvider = new IngestionEngineStorage({
      area: browser.storage.sync,
      ttlMs: 80,
    });

    this.ignoreElements = new Set(ignoreElements);
    this.startNode = startNode;

    this.init();
  }

  /**
   * Initializes the replacer by performing initial replacements and setting up
   * observers
   * @private
   */
  private async init(): Promise<void> {
    await this.updateStorageFromCache();

    if (!this.store.preferences?.extensionEnabled) {
      /**
       * The extension is disabled, do not continue
       */
      return;
    }

    await this.waitForDocument();

    this.listenForMessages();
    this.replaceAllNodes();
  }

  /**
   * Sets up a MutationObserver to watch for DOM changes
   * @private
   */
  // private listenForChanges(): void {
  //   const observer = new MutationObserver((mutations) => {
  //     const textMutations = mutations.filter((mutation) =>
  //       this.isRelevantMutation(mutation)
  //     );

  //     this.handleMutations(textMutations);
  //   });

  //   observer.observe(this.startNode, {
  //     characterData: true,
  //     childList: true,
  //     subtree: true,
  //   });
  // }

  /**
   * Sets up a runtime message listener for communication within the extension
   * @private
   */
  private listenForMessages() {
    browser.runtime.onMessage.addListener((message) => {
      const event = message as WebAppMessageData<WebAppMessageKind>;

      if (event.targets !== undefined && !event.targets.includes("content")) {
        return;
      }

      switch (event.kind) {
        case "htmlReplaceResponse": {
          const { data, error } =
            event.details as ErrorableMessage<HTMLReplaceResponse>;

          console.log("replace response data", data);

          // TODO: apply dom mutations from response
          // TODO: make sure large amounts of mutations do not block

          break;
        }
      }

      return undefined;
    });
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessingBatch || this.batchContents.length === 0) {
      return;
    }

    this.isProcessingBatch = true;

    try {
      const batchToProcess = [...this.batchContents];
      this.batchContents = [];

      sendConnectMessage(
        "content",
        "htmlReplaceRequest",
        {
          strings: batchToProcess,
          syncStorage: this.store,
        },
        ["background"]
      );
    } finally {
      this.isProcessingBatch = false;

      // Check if more items were added while processing
      if (this.batchContents.length >= this.batchSize) {
        await this.processBatch();
      }
    }
  }

  /**
   * Processes text nodes for replacement
   * @param textNode - The text node to process
   * @param processedParents - Set of already processed text node parents
   * @private
   */
  private async processTextNode(
    textNode: Text,
    processedParents: Set<HTMLElement>
  ): Promise<void> {
    if (!this.shouldProcessTextNode(textNode, processedParents)) {
      return;
    }

    const { parentElement } = textNode;
    processedParents.add(parentElement);

    this.batchContents.push({
      html: parentElement.outerHTML,
      id: crypto.randomUUID(),
    });

    console.log(
      "processing",
      textNode.textContent,
      JSON.stringify(textNode.textContent),
      "in",
      parentElement
    );

    if (this.batchContents.length >= this.batchSize) {
      await this.processBatch();
    }
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
   *
   * @param textNode - The text node to check
   * @param processedParents - Set of already processed text node parents
   * @returns
   */
  private shouldProcessTextNode(
    textNode: Text,
    processedParents: Set<HTMLElement>
  ): textNode is Text & { parentElement: HTMLElement } {
    const { parentElement } = textNode;
    const textContent = textNode.textContent || "";

    if (textContent.trim() === "") {
      return false;
    }

    if (
      !parentElement ||
      processedParents.has(parentElement) ||
      this.shouldIgnoreElement(parentElement)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Updates the internal storage from cache
   * @private
   */
  private async updateStorageFromCache(): Promise<void> {
    if (this.isProcessingStorage) return;

    try {
      this.isProcessingStorage = true;
      this.store = await this.storageProvider.getStorage();
    } finally {
      this.isProcessingStorage = false;
    }
  }

  /**
   * Waits for the document to be ready
   */
  private async waitForDocument(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Document failed to load within timeout period"));
      }, 6000);

      if (document.readyState === "complete") {
        clearTimeout(timeout);
        resolve();
      } else {
        document.addEventListener("readystatechange", () => {
          if (document.readyState === "complete") {
            clearTimeout(timeout);
            resolve();
          }
        });
      }
    });
  }

  /**
   * Recursively walks through text nodes in an element
   * @param element - The element to walk through
   * @param processedParents - Set of already processed text node parents
   * @private
   */
  private walkTextNodes(
    element: HTMLElement,
    processedParents: Set<HTMLElement>
  ): void {
    if (this.shouldIgnoreElement(element)) return;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Text | null;
    while ((node = walker.nextNode() as Text)) {
      this.processTextNode(node, processedParents);
    }
  }

  /**
   * Performs an initial replacement on the entire start node
   * @public
   */
  public async replaceAllNodes(): Promise<void> {
    await this.updateStorageFromCache();

    const processedParents = new Set<HTMLElement>();
    this.walkTextNodes(this.startNode, processedParents);

    // process any remaining items in the queue
    if (this.batchContents.length > 0) {
      await this.processBatch();
    }
  }
}
