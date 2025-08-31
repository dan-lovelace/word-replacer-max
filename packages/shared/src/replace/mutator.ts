import { ReplacerMutationResult } from "@worm/types/src/message";

export interface MutatorConfig {
  visualProtection?: boolean;
}

const colorMap: Record<number, [string, string]> = {
  0: ["crimson", "lime"],
  1: ["royalblue", "orange"],
  2: ["magenta", "springgreen"],
  3: ["darkorange", "dodgerblue"],
  4: ["hotpink", "limegreen"],
  5: ["#FF1493", "#00FF7F"],
  6: ["#FF4500", "#1E90FF"],
  7: ["#FF69B4", "#32CD32"],
  8: ["#DC143C", "#00CED1"],
  9: ["#FF6347", "#4169E1"],
  10: ["#FF20FF", "#7FFF00"],
  11: ["#FF8C00", "#0080FF"],
  12: ["#E91E63", "#00FF40"],
  13: ["#FF5722", "#2196F3"],
  14: ["#9C27B0", "#8BC34A"],
  15: ["#F44336", "#00BCD4"],
  16: ["#FF9800", "#3F51B5"],
  17: ["#E100FF", "#40E0D0"],
  18: ["#FF3030", "#00FA9A"],
  19: ["#FF1100", "#00BFFF"],
};

export class Mutator implements MutatorConfig {
  private document: Document;

  visualProtection: boolean;

  constructor(document: Document, config?: MutatorConfig) {
    this.document = document;

    this.visualProtection = config?.visualProtection ?? false;
  }

  public executeMutations = (
    messages: ReplacerMutationResult[]
  ): Promise<ReplacerMutationResult[]> => {
    const promises = messages.map(
      (message) =>
        new Promise<ReplacerMutationResult>((resolve) => {
          const { element, html } = message;

          if (!element) {
            resolve(message);
          }

          let mutateCount = Number(element.dataset["mutateCount"] ?? 0);

          if (!colorMap[mutateCount]) {
            mutateCount = 0;
          }

          const colors = colorMap[mutateCount];

          const newElement = this.document.createElement("div");
          newElement.innerHTML = html;

          if (element.parentElement) {
            //   const { parentElement } = element;

            //   parentElement.dataset["mutateCount"] = (mutateCount + 1).toString();

            if (this.visualProtection) {
              element.parentElement.style.setProperty(
                "transition",
                "opacity 100ms ease-out",
                "important"
              );
              element.parentElement.style.setProperty(
                "opacity",
                "1",
                "important"
              );
            }

            //   parentElement.style.setProperty(
            //     "outline",
            //     `2px groove ${colors[0]}`,
            //     "important"
            //   );
            //   parentElement.style.setProperty(
            //     "box-shadow",
            //     `inset 0px 0px 0px 1px ${colors[1]}`,
            //     "important"
            //   );
          }

          const fragment = this.document.createDocumentFragment();
          fragment.append(...newElement.childNodes);

          element.parentElement?.replaceChild(fragment, element);

          resolve(message);
        })
    );

    return Promise.all(promises);
  };
}
