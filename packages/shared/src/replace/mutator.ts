import { ReplacerMutationResult } from "@worm/types/src/message";

export interface MutatorConfig {
  visualProtection?: boolean;
}

const colorMap: Record<number, [string, string]> = {
  0: ["red", "lime"],
  1: ["blue", "tomato"],
  2: ["green", "pink"],
  3: ["yellow", "steelblue"],
  4: ["purple", "thistle"],
};

export class Mutator implements MutatorConfig {
  private document: Document;
  private callback: (results: ReplacerMutationResult[]) => void;

  visualProtection: boolean;

  constructor(
    document: Document,
    callback: (results: ReplacerMutationResult[]) => void,
    config?: MutatorConfig
  ) {
    this.document = document;
    this.callback = callback;

    this.visualProtection = config?.visualProtection ?? false;
  }

  public executeMutations = async (messages: ReplacerMutationResult[]) => {
    console.log("mutating", messages.length);

    // const results: ReplacerMutationResult[] = [];

    // for (const message of messages) {
    //   const { element, html } = message;

    //   if (!element) {
    //     continue;
    //   }

    //   // element.textContent = `${element.textContent}+`;

    //   const mutateCount = Number(element.dataset["mutateCount"] ?? 0);
    //   const colors = colorMap[mutateCount];

    //   element.dataset["mutateCount"] = (mutateCount + 1).toString();

    //   if (this.visualProtection) {
    //     element.style.setProperty(
    //       "transition",
    //       "opacity 150ms ease-out",
    //       "important"
    //     );
    //     element.style.setProperty("opacity", "1", "important");
    //   }
    //   element.setAttribute(
    //     "style",
    //     `border: 2px groove ${colors[0]} !important; box-shadow: inset 0px 0px 0px 1px ${colors[1]} !important;`
    //   );
    //   element.style.filter = "none";

    //   results.push({
    //     ...message,
    //   });
    // }

    const promises = messages.map(
      (message) =>
        new Promise<ReplacerMutationResult>((resolve) => {
          const { element, html } = message;

          if (!element) {
            resolve(message);
          }

          // element.textContent = `${element.textContent}+`;

          const mutateCount = Number(element.dataset["mutateCount"] ?? 0);
          const colors = colorMap[mutateCount];

          element.dataset["mutateCount"] = (mutateCount + 1).toString();

          if (this.visualProtection) {
            element.style.setProperty(
              "transition",
              "opacity 150ms ease-out",
              "important"
            );
            element.style.setProperty("opacity", "1", "important");
          }
          element.setAttribute(
            "style",
            `border: 2px groove ${colors[0]} !important; box-shadow: inset 0px 0px 0px 1px ${colors[1]} !important;`
          );
          element.style.filter = "none";

          resolve(message);
        })
    );

    const results = await Promise.all(promises);
    // console.log("results", results);
    this.callback(results);
  };
}
