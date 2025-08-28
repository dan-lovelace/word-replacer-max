interface IngestConfig {
  batchSize?: number;
  ignoreElements?: Set<TagName>;
}

type TagName = keyof HTMLElementTagNameMap;

export class Ingest implements IngestConfig {
  private batchContents = new Set<HTMLElement>();
  private startNode: Node;

  private callback: (items: HTMLElement[]) => void;

  batchSize: number;
  ignoreElements: Set<TagName>;

  constructor(
    startNode: Node,
    callback: (items: HTMLElement[]) => void,
    config?: Partial<IngestConfig>
  ) {
    // required
    this.startNode = startNode;
    this.callback = callback;

    // optional
    this.batchSize = config?.batchSize ?? 50;
    this.ignoreElements =
      config?.ignoreElements ??
      new Set<TagName>(["input", "script", "style", "textarea"]);
  }

  public start() {
    this.listenForMutations();
    this.walkNode(this.startNode);
  }

  private analyzeAddedNodes(nodes: Node[]) {
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        this.analyzeTextNode(node as Text);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        this.walkNode(node);
      }
    }
  }

  private analyzeTextNode(node: Text) {
    if (!this.isTextNodeValid(node)) {
      return;
    }

    const { parentElement } = node;
    this.batchContents.add(parentElement);

    if (this.batchContents.size >= this.batchSize) {
      this.processBatch();
    }
  }

  private handleMutations(mutations: MutationRecord[]) {
    if (mutations.length === 0) return;

    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        this.analyzeTextNode(mutation.target as Text);
      } else {
        this.analyzeAddedNodes(Array.from(mutation.addedNodes));
      }
    }

    this.processBatch();
  }

  private isRelevantMutation(mutation: MutationRecord): boolean {
    if (mutation.type === "characterData") return true;

    return Array.from(mutation.addedNodes).some(
      (node) =>
        node.nodeType === Node.TEXT_NODE ||
        (node.nodeType === Node.ELEMENT_NODE && node.hasChildNodes())
    );
  }

  private isTextNodeValid(
    node: Text
  ): node is Text & { parentElement: HTMLElement } {
    const { parentElement } = node;
    const textContent = node.textContent || "";

    if (textContent.trim() === "") {
      return false;
    }

    if (!parentElement || this.shouldIgnoreElement(parentElement)) {
      return false;
    }

    return true;
  }

  private listenForMutations(): void {
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

  private processBatch() {
    if (this.batchContents.size === 0) return;

    const processed = Array.from(this.batchContents);
    this.batchContents.clear();

    this.callback(processed);
  }

  private shouldIgnoreElement(element: HTMLElement): boolean {
    return this.ignoreElements.has(element.tagName.toLowerCase() as TagName);
  }

  private walkNode(node: Node) {
    if (this.shouldIgnoreElement(node as HTMLElement)) return;

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

    let currentNode: Text | null;

    while ((currentNode = walker.nextNode() as Text)) {
      this.analyzeTextNode(currentNode);
    }

    this.processBatch();
  }
}
