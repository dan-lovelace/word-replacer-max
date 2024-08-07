import { replaceAll } from "@worm/shared/src/replace";

import { selectors as s } from "../support/selectors";

describe("replaceAll", () => {
  describe("default query pattern", () => {
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
              identifier: "ABCD-1234",
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
              identifier: "ABCD-1234",
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

    it("does not overwrite surrounding children", () => {
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
              identifier: "ABCD-1234",
              queries: ["dolor"],
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
              identifier: "ABCD-1234",
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
              identifier: "ABCD-1234",
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

    it("works for wikipedia", () => {
      cy.visitMock({
        html: "wiki.html",
      });

      cy.document().then((document) => {
        replaceAll(
          [
            {
              active: true,
              identifier: "ABCD-1234",
              queries: ["2014"],
              queryPatterns: [],
              replacement: "1979",
            },
          ],
          document
        );

        cy.findByTestId("anchor1").should(
          "have.text",
          "1979 Commonwealth Games"
        );
        cy.findByTestId("anchor2").should(
          "have.text",
          "1979 ITU World Triathlon Series"
        );
        s.target().contains("from 1979 to 2016");
      });
    });

    it("does not overwrite text input value", () => {
      cy.visitMock({
        bodyContents: `
          <input data-testid="input-target" type="text" value="Lorem ipsum dolor"></input>
          <div data-testid="target">Lorem ipsum dolor</div>
        `,
      });

      cy.document().then((document) => {
        replaceAll(
          [
            {
              active: true,
              identifier: "ABCD-1234",
              queries: ["ipsum"],
              queryPatterns: [],
              replacement: "sit",
            },
          ],
          document
        );

        cy.findByTestId("input-target").should(
          "have.value",
          "Lorem ipsum dolor"
        );
        s.target().should("have.text", "Lorem sit dolor");
      });
    });

    it("does not overwrite textarea input value", () => {
      cy.visitMock({
        bodyContents: `
          <textarea data-testid="input-target">Lorem ipsum dolor</textarea>
          <div data-testid="target">Lorem ipsum dolor</div>
        `,
      });

      cy.document().then((document) => {
        replaceAll(
          [
            {
              active: true,
              identifier: "ABCD-1234",
              queries: ["ipsum"],
              queryPatterns: [],
              replacement: "sit",
            },
          ],
          document
        );

        cy.findByTestId("input-target").should(
          "have.text",
          "Lorem ipsum dolor"
        );
        s.target().should("have.text", "Lorem sit dolor");
      });
    });

    it("does not overwrite elements that have the 'contenteditable' attribute", () => {
      cy.visitMock({
        bodyContents: `
          <div data-testid="target" contenteditable>Lorem ipsum dolor</div>
        `,
      });

      cy.document().then((document) => {
        replaceAll(
          [
            {
              active: true,
              identifier: "ABCD-1234",
              queries: ["ipsum"],
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

  describe("'regex' query pattern only", () => {
    it("works for regex negative lookaheads", () => {
      cy.visitMock({
        targetContents: `
        <div data-testid="target-1">Hours: 7,5</div>
        <div data-testid="target-2">Hours: 8,55</div>
        <div data-testid="target-3">5Hours: 8,5Lorem</div>
      `,
      });

      cy.document().then((document) => {
        replaceAll(
          [
            {
              active: true,
              identifier: "ABCD-1234",
              queries: ["\\b(\\d+),5(?!\\d)"],
              queryPatterns: ["regex"],
              replacement: "$1,test",
            },
          ],
          document
        );

        cy.findByTestId("target-1").should("have.text", "Hours: 7,test");
        cy.findByTestId("target-2").should("have.text", "Hours: 8,55");
        cy.findByTestId("target-3").should("have.text", "5Hours: 8,testLorem");
      });
    });
  });

  describe("'wholeWord' query pattern only", () => {
    it("does not remove empty space around sibling elements for 'wholeWord' pattern", () => {
      cy.visitMock({
        bodyContents: `
          <p data-testid="target">
            Lorem ipsum <a>dolor</a>.
          </p>
        `,
      });

      cy.document().then((document) => {
        replaceAll(
          [
            {
              active: true,
              identifier: "ABCD-1234",
              queries: ["ipsum"],
              queryPatterns: ["wholeWord"],
              replacement: "sit",
            },
          ],
          document
        );

        s.target().should("include.text", "Lorem sit dolor.");
      });
    });
  });
});
