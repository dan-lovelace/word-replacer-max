import { Browser } from "webextension-polyfill";

import { ReplacerMutationResult } from "@worm/types/src/message";

import { Ingest } from "./ingest";
import { Messenger } from "./messenger";
import { Mutator } from "./mutator";

export class Replacer {
  private browser: Browser;
  private document: Document;
  private ingest: Ingest;
  private messenger: Messenger;
  private mutator: Mutator;

  constructor(browser: Browser, document: Document) {
    this.browser = browser;
    this.document = document;

    this.messenger = new Messenger(this.browser, this.handleMessages);
    this.ingest = new Ingest(this.document.documentElement, this.handleIngest);
    this.mutator = new Mutator(this.document, this.handleMutationsComplete);
  }

  public start = () => {
    // TODO: do not start if extension is OFF
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
}
