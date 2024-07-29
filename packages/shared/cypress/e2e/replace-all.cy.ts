import { replaceAll } from "@worm/shared/src/replace";

import { selectors as s } from "../lib/selectors";

describe("replaceAll", () => {
  it("includes 'title' elements in the head", () => {
    cy.visitMock({
      targetContents: "Lorem ipsum dolor",
      titleContents: "Lorem ipsum dolor",
    });

    cy.document().then((document) => {
      replaceAll(
        [
          {
            active: true,
            identifier: "1234",
            queries: ["ipsum"],
            queryPatterns: [],
            replacement: "sit",
          },
        ],
        document
      );

      s.target().should("have.text", "Lorem sit dolor");
      s.title().should("have.text", "Lorem sit dolor");
    });
  });

  it("does not overwrite 'script' elements", () => {
    const headScriptContents = `
      function ipsum() {

      }
    `;
    cy.visitMock({
      bodyContents: `
        <p data-testid="target">Lorem ipsum dolor</p>
        <script data-testid="bodyScript">
          const html = document.createElement("html");
          html.innerHTML = "<body>Lorem ipsum dolor sit</body>";
        </script>
      `,
      scriptContents: headScriptContents,
      titleContents: "Lorem ipsum dolor",
    });

    cy.document().then((document) => {
      replaceAll(
        [
          {
            active: true,
            identifier: "1234",
            queries: ["ipsum"],
            queryPatterns: [],
            replacement: "sit",
          },
        ],
        document
      );

      s.script().should("have.text", headScriptContents);
      s.target().should("have.text", "Lorem sit dolor");
      s.title().should("have.text", "Lorem sit dolor");

      cy.findByTestId("bodyScript").then(($bodyScript) => {
        const target = $bodyScript.get(0);

        const contents = target.textContent
          ?.split("\n")
          .map((l) => l?.trim())
          .filter(Boolean);
        cy.wrap(contents?.[0]).should(
          "equal",
          'const html = document.createElement("html");'
        );
        cy.wrap(contents?.[1]).should(
          "equal",
          'html.innerHTML = "<body>Lorem ipsum dolor sit</body>";'
        );
      });
    });
  });

  it.only("does not overwrite surrounding elements", () => {
    cy.visitMock({
      targetContents: `
        <h3 class="h3-mktg mb-4 text-medium">
          <span data-testid="span" class="text-accent-primary d-block">Lorem ipsum</span>
          Sit dolor
        </h3>
      `,
    });

    cy.document().then((document) => {
      replaceAll(
        [
          {
            active: true,
            identifier: "1234",
            queries: ["ipsum"],
            queryPatterns: [],
            replacement: "sit",
          },
        ],
        document
      );

      cy.findByTestId("span").should("have.text", "Lorem ipsum");
    });
  });

  it("maintains text enhancement elements", () => {
    cy.visitMock({
      targetContents: "Lorem <u>ipsum</u> dolor",
    });

    cy.document().then((document) => {
      replaceAll(
        [
          {
            active: true,
            identifier: "1234",
            queries: ["ipsum"],
            queryPatterns: [],
            replacement: "sit",
          },
        ],
        document
      );

      cy.get("u").should("have.text", "sit");
    });
  });

  it("does not match across element boundaries", () => {
    cy.visitMock({
      targetContents: "Lorem <u>ipsum</u> dolor",
    });

    cy.document().then((document) => {
      replaceAll(
        [
          {
            active: true,
            identifier: "1234",
            queries: ["ipsum dolor"],
            queryPatterns: [],
            replacement: "sit",
          },
        ],
        document
      );

      s.target().should("have.text", "Lorem ipsum dolor");
    });
  });
});
