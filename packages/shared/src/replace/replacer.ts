import { Browser } from "webextension-polyfill";

import {
  ReplacementMessageItem,
  ReplacerMutationResult,
  WebAppMessageData,
} from "@worm/types/src/message";

import { createWebAppMessage } from "../messaging";

import { Ingest } from "./ingest";
import { Messenger } from "./messenger";
import { Mutator } from "./mutator";

export interface ReplacerConfig {
  isEnabled?: boolean;
}

export class WebExtensionReplacer implements ReplacerConfig {
  public readonly DEFAULT_CONFIG: Required<ReplacerConfig> = {
    isEnabled: true,
  };

  private browser: Browser;
  private document: Document;
  private ingest: Ingest;
  private messenger: Messenger;
  private mutator: Mutator;

  isEnabled: boolean;

  constructor(browser: Browser, document: Document, config?: ReplacerConfig) {
    this.browser = browser;
    this.document = document;

    // configuration
    this.isEnabled = config?.isEnabled ?? this.DEFAULT_CONFIG.isEnabled;

    // replacer classes
    this.ingest = new Ingest(this.document, this.handleIngest, {
      visualProtection: false,
    });
    this.messenger = new Messenger(
      this.sendRuntimeMessage,
      this.handleMessages
    );
    this.mutator = new Mutator(this.document, this.handleMutationsComplete, {
      visualProtection: false,
    });
  }

  public start = () => {
    if (!this.isEnabled) return;

    this.ingest.start();
  };

  private handleIngest = (found: HTMLElement[]) => {
    this.messenger.sendReplacementRequest(found);
  };

  private handleMessages = (messages: ReplacerMutationResult[]) => {
    this.ingest.stopObserver();
    this.mutator.executeMutations(messages);
  };

  private handleMutationsComplete = (results: ReplacerMutationResult[]) => {
    this.ingest.startObserver();
  };

  private sendRuntimeMessage = async (
    message: ReplacementMessageItem[]
  ): Promise<ReplacementMessageItem[] | undefined> => {
    const replacementRequest = createWebAppMessage(
      "processReplacementsRequest",
      message
    );
    const result = await this.browser.runtime.sendMessage<
      WebAppMessageData<"processReplacementsRequest">,
      WebAppMessageData<"processReplacementsResponse">
    >(replacementRequest);

    return result.details?.data;
  };
}
