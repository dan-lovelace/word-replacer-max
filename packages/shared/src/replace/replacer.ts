import { Browser } from "webextension-polyfill";

import { Ingest } from "@worm/shared/src/replace/ingest";
import { Messenger } from "@worm/shared/src/replace/messenger";
import { ReplacementMessageItem } from "@worm/types/src/message";

export class Replacer {
  private browser: Browser;
  private documentElement: HTMLElement;
  private ingest: Ingest;
  private messenger: Messenger;

  constructor(browser: Browser, documentElement: HTMLElement) {
    this.browser = browser;
    this.documentElement = documentElement;

    this.ingest = new Ingest(this.documentElement, this.handleIngest);
    this.messenger = new Messenger(this.browser, this.handleMessages);
  }

  public start() {
    this.ingest.start();
  }

  private handleIngest(found: HTMLElement[]) {
    this.messenger.sendReplacementRequest(found);
  }

  private async handleMessages(messages: ReplacementMessageItem[]) {
    // TODO: perform mutations
  }
}
