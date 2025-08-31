import { merge } from "ts-deepmerge";

import { Replacer, ReplacerRule } from "@worm/shared/src/replace/replacer";
import { ReplacementMessageItem } from "@worm/types/src/message";

const TEST_UUID = {
  MESSAGE: crypto.randomUUID(),
  RULE: crypto.randomUUID(),
};

const generateMessage = (overrides?: Partial<ReplacementMessageItem>) => {
  const defaults: ReplacementMessageItem = {
    createdAt: Date.now(),
    html: "<div>Lorem ipsum dolor</div>",
    id: `${TEST_UUID.MESSAGE}-0`,
  };

  return merge.withOptions(
    {
      mergeArrays: false,
    },
    defaults,
    overrides ?? {}
  ) as ReplacementMessageItem;
};

const generateRule = (overrides?: Partial<ReplacerRule>) => {
  const defaults: ReplacerRule = {
    isEnabled: true,
    identifier: TEST_UUID.RULE,
    queries: ["ipsum"],
    queryPatterns: ["default"],
    replacements: ["sit"],
  };

  return merge.withOptions(
    {
      mergeArrays: false,
    },
    defaults,
    overrides ?? {}
  ) as ReplacerRule;
};

describe("Replacer", () => {
  it("should not replace if no rules are enabled", () => {
    cy.document().then(($document) => {
      const replacer = new Replacer($document, {
        rules: [generateRule({ isEnabled: false })],
      });
      const testMessages = [generateMessage()];

      cy.wrap(replacer.handleMessages(testMessages)).should(
        "deep.equal",
        testMessages
      );
    });
  });

  it("should not replace if no queries exist", () => {
    cy.document().then(($document) => {
      const replacer = new Replacer($document, {
        rules: [generateRule({ queries: [] })],
      });
      const testMessages = [generateMessage()];

      cy.wrap(replacer.handleMessages(testMessages)).should(
        "deep.equal",
        testMessages
      );
    });
  });

  it("should not replace if no replacements exist", () => {
    cy.document().then(($document) => {
      const replacer = new Replacer($document, {
        rules: [generateRule({ replacements: [] })],
      });
      const testMessages = [generateMessage()];

      cy.wrap(replacer.handleMessages(testMessages)).should(
        "deep.equal",
        testMessages
      );
    });
  });

  it("should replace single words on single text nodes with only one rule", () => {
    cy.document().then(($document) => {
      const replacer = new Replacer($document, {
        rules: [generateRule()],
      });
      const testMessages = [generateMessage()];

      cy.wrap(replacer.handleMessages(testMessages)).should("deep.equal", [
        {
          ...testMessages[0],
          html: "<div>Lorem sit dolor</div>",
        },
      ]);
    });
  });

  it("should replace single words on single text nodes with more than one rule", () => {
    cy.document().then(($document) => {
      const replacer = new Replacer($document, {
        rules: [
          generateRule(),
          generateRule({
            identifier: crypto.randomUUID(),
            queries: ["dolor"],
            replacements: ["amet"],
          }),
        ],
      });
      const testMessages = [generateMessage()];

      cy.wrap(replacer.handleMessages(testMessages)).should("deep.equal", [
        {
          ...testMessages[0],
          html: "<div>Lorem sit amet</div>",
        },
      ]);
    });
  });

  it("should replace words on buttons with click listeners", () => {
    cy.visitMock();

    cy.document().then(($document) => {
      const wrapper = $document.createElement("div");

      const clickable = $document.createElement("button");
      clickable.textContent = "Lorem ipsum dolor";
      clickable.addEventListener("click", () => {
        showable.style.setProperty("display", "block");
      });

      const showable = $document.createElement("div");
      showable.textContent =
        "The Math.random() static method returns a floating-point, pseudo-random number that's greater than or equal to 0 and less than 1, with approximately uniform distribution over that range — which you can then scale to your desired range.";
      showable.style.setProperty("display", "none");

      wrapper.appendChild(clickable);

      $document.body.appendChild(wrapper);
      $document.body.appendChild(showable);

      const replacer = new Replacer($document, {
        rules: [generateRule()],
      });
      const testMessages = [
        generateMessage({
          html: wrapper.innerHTML.trim(),
        }),
      ];

      cy.wrap(replacer.handleMessages(testMessages)).should("deep.equal", [
        {
          ...testMessages[0],
          html: "<button>Lorem sit dolor</button>",
        },
      ]);
    });
  });
});
