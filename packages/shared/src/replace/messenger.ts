import { Browser } from "webextension-polyfill";

import { createWebAppMessage } from "@worm/shared/src/messaging";
import {
  ReplacementMessageId,
  ReplacementMessageItem,
  ReplacerMutationResult,
  WebAppMessageData,
} from "@worm/types/src/message";

export class Messenger {
  private browser: Browser;
  private elementData: WeakMap<
    HTMLElement,
    { createdAt: number; id: ReplacementMessageId }
  >;
  private messageElements: Map<ReplacementMessageId, HTMLElement>;

  private callback: (items: ReplacerMutationResult[]) => void;

  constructor(
    browser: Browser,
    callback: (messages: ReplacerMutationResult[]) => void
  ) {
    this.browser = browser;
    this.elementData = new WeakMap<
      HTMLElement,
      { createdAt: number; id: ReplacementMessageId }
    >();
    this.messageElements = new Map<ReplacementMessageId, HTMLElement>();

    this.callback = callback;
  }

  private buildReplacementRequest = (elements: HTMLElement[]) => {
    const createdAt = Date.now();
    const messageItems: ReplacementMessageItem[] = [];
    const requestId = crypto.randomUUID();

    for (const [idx, element] of elements.entries()) {
      const id = `${requestId}-${idx}`;

      this.messageElements.set(id, element);
      this.elementData.set(element, { createdAt, id });

      messageItems.push({
        createdAt,
        html: element.outerHTML,
        id,
      });
    }

    const replacementRequest = createWebAppMessage(
      "processReplacementsRequest",
      messageItems
    );

    return replacementRequest;
  };

  private handleReplacementResponse = (results: ReplacementMessageItem[]) => {
    const callbackItems: ReplacerMutationResult[] = [];

    for (const result of results) {
      const { createdAt: messageCreatedAt, id: messageId } = result;

      const queuedElement = this.messageElements.get(messageId);

      if (!queuedElement) {
        // message not in queue or element no longer exists, ignore it
        continue;
      }

      const queuedData = this.elementData.get(queuedElement);

      if (!queuedData) {
        // element not in queue, ignore this message and delete it
        this.messageElements.delete(messageId);
        continue;
      }

      if (queuedData.id !== messageId) {
        // element has received a newer message, ignore this one and delete it
        this.messageElements.delete(messageId);
        continue;
      }

      this.messageElements.delete(messageId); // element definitely exists
      this.elementData.delete(queuedElement); // data definitely exist

      callbackItems.push({
        ...result,
        element: queuedElement,
      });
    }

    if (callbackItems.length === 0) {
      return;
    }

    this.callback(callbackItems);
  };

  public getMessages = () => {
    return {
      messageElements: this.messageElements,
      elementData: this.elementData,
    };
  };

  public sendReplacementRequest = async (elements: HTMLElement[]) => {
    if (elements.length === 0) return;

    const replacementRequest = this.buildReplacementRequest(elements);
    const result = await this.browser.runtime.sendMessage<
      WebAppMessageData<"processReplacementsRequest">,
      WebAppMessageData<"processReplacementsResponse">
    >(replacementRequest);
    console.log("result", result);
    if (
      !result ||
      !result.details ||
      !result.details.data ||
      !Array.isArray(result.details.data) ||
      result.details.data.length === 0
    ) {
      return;
    }

    this.handleReplacementResponse(result.details.data);
  };
}
