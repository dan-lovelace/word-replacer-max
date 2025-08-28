import { ReplacerMutationResult } from "@worm/types/src/message";

const colorMap: Record<number, [string, string]> = {
  0: ["red", "lime"],
  1: ["blue", "tomato"],
  2: ["green", "pink"],
  3: ["yellow", "steelblue"],
  4: ["purple", "thistle"],
};

export class Mutator {
  private document: Document;
  private callback: (results: ReplacerMutationResult[]) => void;

  constructor(
    document: Document,
    callback: (results: ReplacerMutationResult[]) => void
  ) {
    this.document = document;
    this.callback = callback;
  }

  public executeMutations = async (messages: ReplacerMutationResult[]) => {
    console.log("mutating", messages.length);
    // const results: ReplacerMutationResult[] = [];

    // for (const message of messages) {
    //   const { element, html } = message;

    //   if (!element) {
    //     results.push({
    //       ...message,
    //       changed: false,
    //     });
    //     continue;
    //   }

    //   // element.textContent = `${element.textContent}+`;

    //   const mutateCount = Number(element.dataset["mutateCount"] ?? 0);
    //   const colors = colorMap[mutateCount];

    //   element.dataset["mutateCount"] = (mutateCount + 1).toString();
    //   element.setAttribute(
    //     "style",
    //     `border: 2px groove ${colors[0]} !important; box-shadow: inset 0px 0px 0px 1px ${colors[1]} !important;`
    //   );

    //   results.push({
    //     ...message,
    //     changed: true,
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
          element.setAttribute(
            "style",
            `border: 2px groove ${colors[0]} !important; box-shadow: inset 0px 0px 0px 1px ${colors[1]} !important;`
          );

          resolve(message);
        })
    );

    const results = await Promise.all(promises);
    // console.log("results", results);
    this.callback(results);
  };
}
