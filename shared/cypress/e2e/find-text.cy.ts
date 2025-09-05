import { findText } from "@web-extension/shared/src/replace";

import { selectors as s } from "../support/selectors";

const DEFAULT_TEST_STRING = "Lorem ipsum dolor sit amet";

describe("findText", () => {
  describe("default query pattern", () => {
    it("can return empty", () => {
      cy.visitMock({
        targetContents: DEFAULT_TEST_STRING,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "shrike", []);
        cy.wrap(result).should("have.length", 0);
      });
    });

    it("matches a single node", () => {
      cy.visitMock({
        targetContents: DEFAULT_TEST_STRING,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", []);
        cy.wrap(result).should("have.length", 1);
      });
    });

    it("does not match across line breaks", () => {
      cy.visitMock({
        targetContents: `
          Lorem
          ipsum
          dolor
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Lorem ipsum", []);
        cy.wrap(result).should("have.length", 0);
      });
    });

    it("matches multiple nodes", () => {
      cy.visitMock({
        targetContents: `
          <p>${DEFAULT_TEST_STRING}</p>
          <p>${DEFAULT_TEST_STRING}</p>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", []);
        cy.wrap(result).should("have.length", 2);
      });
    });

    it("matches child text", () => {
      cy.visitMock({
        targetContents: `
          <p>
            <span>This is a test</span>
            ${DEFAULT_TEST_STRING}
          </p>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", []);
        cy.wrap(result).should("have.length", 1);
      });
    });

    it.skip("merges adjacent text nodes into one", () => {
      cy.visitMock({
        targetContents: `
          <p></p>
        `,
      });

      cy.document().then((document) => {
        const textNode1 = document.createTextNode("Lorem");
        const textNode2 = document.createTextNode("ipsum");
        const target = document.querySelector("p");

        target?.appendChild(textNode1);
        target?.appendChild(textNode2);

        s.html().then(($element) => {
          const html = $element.get(0);

          const result = findText(html, "Lorem ipsum", []);
          cy.wrap(result).should("have.length", 1);
        });
      });
    });

    it.skip("trims empty space around adjacent text nodes before merging", () => {
      cy.visitMock({
        targetContents: `
          <p></p>
        `,
      });

      cy.document().then((document) => {
        const textNode1 = document.createTextNode("Lorem ");
        const textNode2 = document.createTextNode("  ipsum");
        const target = document.querySelector("p");

        target?.appendChild(textNode1);
        target?.appendChild(textNode2);

        s.html().then(($element) => {
          const html = $element.get(0);

          const result = findText(html, "Lorem ipsum", []);
          cy.wrap(result).should("have.length", 1);
        });
      });
    });
  });

  describe("'case' query pattern only", () => {
    it("can return empty", () => {
      cy.visitMock({
        targetContents: DEFAULT_TEST_STRING,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum", ["case"]);
        cy.wrap(result).should("have.length", 0);
      });
    });

    it("matches a single node", () => {
      cy.visitMock({
        targetContents: DEFAULT_TEST_STRING,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", ["case"]);
        cy.wrap(result).should("have.length", 1);
      });
    });

    it("matches a multiple nodes", () => {
      const testString = "Lorem Ipsum dolor";
      cy.visitMock({
        bodyContents: `
          <div>
            <p>${testString}</p>
            <p>
              <span>${testString}</span>
            </p>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum", ["case"]);
        cy.wrap(result).should("have.length", 2);
      });
    });

    it("only matches same case", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <p id="target">${DEFAULT_TEST_STRING.toUpperCase()}</p>
            <p>${DEFAULT_TEST_STRING}</p>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "IPSUM", ["case"]);
        cy.wrap(result).should("have.length", 1);
      });
    });
  });

  describe("'wholeWord' query pattern only", () => {
    it("can return empty", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <p>Lorem dolor ipsumit</p>
            <p>Lorem dolor sipsum</p>
            <p>Lorem dolor sipsumit</p>
            <p>Lorem dolor sipsum.</p>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", ["wholeWord"]);
        cy.wrap(result).should("have.length", 0);
      });
    });

    it("matches a single node", () => {
      cy.visitMock({
        targetContents: DEFAULT_TEST_STRING,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", ["wholeWord"]);
        cy.wrap(result).should("have.length", 1);
      });
    });

    it("matches a multiple nodes", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <span>${DEFAULT_TEST_STRING}</span>
            <span>Lorem Ipsum dolor</span>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum", ["wholeWord"]);
        cy.wrap(result).should("have.length", 2);
      });
    });

    it("matches with puncutation 1", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <span>Lorem Ipsum.</span>

            <span>Lorem .Ipsum</span>
            <span>Lorem Ipsum/</span>
            <span>Lorem Ipsum-</span>
            <span>Lorem Ipsum_</span>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum.", ["wholeWord"]);
        cy.wrap(result).should("have.length", 1);
      });
    });

    it("matches with puncutation 2", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <span>Lorem Ipsum-</span>

            <span>Lorem -Ipsum</span>
            <span>Lorem Ipsum/</span>
            <span>Lorem Ipsum_</span>
            <span>Lorem Ipsum .</span>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum-", ["wholeWord"]);
        cy.wrap(result).should("have.length", 1);
      });
    });

    it("is case-insensitive", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <p>${DEFAULT_TEST_STRING}</p>
            <p>Lorem Ipsum dolor</p>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "ipsum", ["wholeWord"]);
        cy.wrap(result).should("have.length", 2);
      });
    });
  });

  describe("'case' and 'wholeWord' query patterns together", () => {
    it("can return empty", () => {
      cy.visitMock({
        targetContents: DEFAULT_TEST_STRING,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum", ["case", "wholeWord"]);
        cy.wrap(result).should("have.length", 0);
      });
    });

    it("matches a single node", () => {
      cy.visitMock({
        bodyContents: `
          <div>
            <p>Lorem Ipsum dolor</p>
            <p>Lorem ipsum dolor</p>
            <p>Lorem ipsum dolor sIpsumit</p>
          </div>
        `,
      });

      s.html().then(($element) => {
        const html = $element.get(0);

        const result = findText(html, "Ipsum", ["case", "wholeWord"]);
        cy.wrap(result).should("have.length", 1);
      });
    });
  });
});
