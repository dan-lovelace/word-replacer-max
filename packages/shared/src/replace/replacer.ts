import { ReplacementMessageItem } from "@worm/types/src/message";
import { QueryPattern } from "@worm/types/src/replace";

export interface ReplacerConfig {
  rules?: ReplacerRule[];
}

export interface ReplacerRule {
  identifier: ReplacerRuleId;
  isEnabled: boolean;
  queries: ReplacerQuery[];
  queryPatterns: QueryPattern[];
  replacements: ReplacerReplacement[];
}

export type ReplacerQuery = string;

export type ReplacerReplacement = string;

export type ReplacerRuleId = string;

export class Replacer {
  private compiledRegEx = new Map<
    ReplacerRule["identifier"],
    Map<ReplacerQuery, RegExp>
  >();
  private document: Document;
  private enabledRules: ReplacerRule[] = [];
  private templateElement: HTMLElement;

  rules: ReplacerRule[];

  constructor(document: Document, config?: ReplacerConfig) {
    this.document = document;
    this.templateElement = this.document.createElement("div");

    this.rules = config?.rules ?? [];
  }

  public handleMessages = (
    messages: ReplacementMessageItem[]
  ): ReplacementMessageItem[] => {
    this.updateEnabledRules();

    if (this.enabledRules.length === 0) {
      return messages;
    }

    this.compileRegExes();

    const results = messages.map((message) => {
      const { html } = message;

      this.templateElement.innerHTML = html;

      if (!this.templateElement.innerText.trim()) {
        // do not consider elements without rendered text
        return message;
      }

      const htmlWalker = this.document.createTreeWalker(
        this.templateElement,
        NodeFilter.SHOW_TEXT
      );

      let currentNode: Node | null;

      while ((currentNode = htmlWalker.nextNode())) {
        if (!currentNode.textContent?.trim()) {
          continue;
        }

        for (const rule of this.enabledRules) {
          const queryRegEx = this.compiledRegEx.get(rule.identifier);
          if (!queryRegEx) {
            continue;
          }

          for (const query of rule.queries) {
            if (query.length === 0) {
              continue;
            }

            const expression = queryRegEx.get(query);
            if (!expression) {
              continue;
            }

            const matches = currentNode.textContent?.match(expression);
            if (currentNode.textContent === null || !matches) {
              continue;
            }

            const replacementCandidates = rule.replacements.filter(Boolean);
            if (replacementCandidates.length === 0) {
              continue;
            }

            const replacementIdx =
              replacementCandidates.length > 1
                ? Math.floor(Math.random() * replacementCandidates.length)
                : 0;

            const newText = currentNode.textContent
              .replace(query, replacementCandidates[replacementIdx])
              .toString();

            currentNode.textContent = newText;
          }
        }
      }

      return {
        createdAt: message.createdAt,
        html: this.templateElement.innerHTML,
        id: message.id,
      };
    });

    return results;
  };

  private compileRegExes = () => {
    this.compiledRegEx?.clear();

    for (const rule of this.rules) {
      const ruleRegEx = new Map<ReplacerQuery, RegExp>();

      for (const query of rule.queries) {
        if (query.length > 0) {
          ruleRegEx.set(query, new RegExp(query, "g"));
        }
      }

      this.compiledRegEx.set(rule.identifier, ruleRegEx);
    }
  };

  private updateEnabledRules = () => {
    this.enabledRules = this.rules.filter(
      (rule) =>
        rule.isEnabled &&
        rule.queries.length > 0 &&
        rule.replacements.length > 0
    );
  };
}
