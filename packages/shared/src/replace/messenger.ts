import {
  ReplacementMessageId,
  ReplacementMessageItem,
  ReplacerMutationResult,
} from "@worm/types/src/message";
import {
  ReplacerElementMap,
  ReplacerMessageMap,
} from "@worm/types/src/replace";

export class Messenger {
  private elementData: ReplacerElementMap;
  private messageElements: ReplacerMessageMap;

  private callback: (items: ReplacerMutationResult[]) => void;
  private sendMessage: (
    request: ReplacementMessageItem[]
  ) => Promise<ReplacementMessageItem[] | undefined>;

  constructor(
    sendMessage: (
      request: ReplacementMessageItem[]
    ) => Promise<ReplacementMessageItem[] | undefined>,
    callback: (messages: ReplacerMutationResult[]) => void
  ) {
    this.elementData = new WeakMap<
      HTMLElement,
      { createdAt: number; id: ReplacementMessageId }
    >();
    this.messageElements = new Map<ReplacementMessageId, HTMLElement>();

    this.callback = callback;
    this.sendMessage = sendMessage;
  }

  private buildReplacementRequest = (
    elements: HTMLElement[]
  ): ReplacementMessageItem[] => {
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

    return messageItems;
  };

  private handleReplacementResponse = (
    results: ReplacementMessageItem[]
  ): void => {
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

  public sendReplacementRequest = async (
    elements: HTMLElement[]
  ): Promise<void> => {
    if (elements.length === 0) return;

    const replacementRequest = this.buildReplacementRequest(elements);

    const result = await this.sendMessage(replacementRequest);

    if (!result || !Array.isArray(result) || result.length === 0) {
      return;
    }

    this.handleReplacementResponse(result);
  };
}
