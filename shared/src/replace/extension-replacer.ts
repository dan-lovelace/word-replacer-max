import { Browser } from "webextension-polyfill";

import { Ingest, Message, Mutate } from "@wordreplacermax/replace";
import {
  ReplacementMessageItem,
  ReplacerMutationResult,
  WebAppMessageData,
} from "@wordreplacermax/types/src/message";

import { createWebAppMessage } from "../messaging";

export interface WebExtensionReplacerConfig {
  isEnabled?: boolean;
}

export class WebExtensionReplacer implements WebExtensionReplacerConfig {
  public readonly DEFAULT_CONFIG: Required<WebExtensionReplacerConfig> = {
    isEnabled: true,
  };

  private browser: Browser;
  private document: Document;
  private ingest: Ingest;
  private messenger: Message;
  private mutator: Mutate;

  isEnabled: boolean;

  constructor(
    browser: Browser,
    document: Document,
    config?: WebExtensionReplacerConfig
  ) {
    this.browser = browser;
    this.document = document;

    // configuration
    this.isEnabled = config?.isEnabled ?? this.DEFAULT_CONFIG.isEnabled;

    // replacer classes
    this.ingest = new Ingest(this.document, this.handleIngest, {
      visualProtection: false,
    });
    this.messenger = new Message(this.sendRuntimeMessage, this.handleMessages);
    this.mutator = new Mutate(this.document, {
      visualProtection: false,
    });
  }

  public start = (): void => {
    if (!this.isEnabled) return;

    this.ingest.start();
  };

  private handleIngest = (found: HTMLElement[]): void => {
    this.messenger.sendReplacementRequest(found);
  };

  private handleMessages = (messages: ReplacerMutationResult[]): void => {
    this.ingest.stopObserver();

    this.mutator.executeMutations(messages).then(() => {
      this.ingest.startObserver();
    });
  };

  private sendRuntimeMessage = async (
    message: ReplacementMessageItem[]
  ): Promise<ReplacementMessageItem[] | undefined> => {
    const replacementRequest = createWebAppMessage(
      "processReplacementsRequest",
      message,
      ["background"]
    );

    const result = await this.browser.runtime.sendMessage<
      WebAppMessageData<"processReplacementsRequest">,
      ReplacementMessageItem[] | undefined
    >(replacementRequest);

    return result;
  };
}
