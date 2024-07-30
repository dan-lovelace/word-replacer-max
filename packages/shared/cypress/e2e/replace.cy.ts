import { replace, searchNode } from "@worm/shared/src/replace";
import { QueryPattern } from "@worm/types";

import { selectors as s } from "../lib/selectors";

/**
 * Utility function to reduce code duplication.
 */
function searchAndReplace(
  element: HTMLElement,
  query: string,
  queryPatterns: QueryPattern[],
  replacement: string
) {
  const results = searchNode(element, query, queryPatterns);

  replace(results[0], query, queryPatterns, replacement);
}

describe("replace", () => {
  describe("default query pattern", () => {
    it("works for single words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", [], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "lorem ipsum", [], "sit");
        cy.wrap($element).should("have.text", "sit dolor");
      });
    });

    it("works for multiple rules in the same element", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor sit amet",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", [], "sit");
        searchAndReplace(target, "dolor", [], "sit");
        cy.wrap($element).should("have.text", "Lorem sit sit sit amet");
      });
    });

    it("does not affect element attributes", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
        targetProps: {
          className: "ipsum",
        },
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", [], "sit");
        cy.wrap($element)
          .should("have.text", "Lorem sit dolor")
          .should("have.attr", "class", "ipsum");
      });
    });

    it("does not recursively replace", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Lo", [], "Losit");
        searchAndReplace(target, "Lo", [], "Losit");
        searchAndReplace(target, "Lo", [], "Losit");
        cy.wrap($element).should("have.text", "Lositrem Ipsum");
      });
    });
  });

  describe("'case' query pattern only", () => {
    it("works for single words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", ["case"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor Ipsum sit ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", ["case"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor Ipsum sit sit");
      });
    });
  });

  describe("'regex' query pattern only", () => {
    it("works with basic patterns 1", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", ["regex"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works with basic patterns 2", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum.*", ["regex"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit");
      });
    });

    it("works with advanced patterns", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "^(Lo)+rem[\\s]+i{1}", ["regex"], "sit");
        cy.wrap($element).should("have.text", "sitpsum dolor");
      });
    });
  });

  describe("'wholeWord' query pattern only", () => {
    it("works for single words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor ipsum.",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum.", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem ipsum dolor sit ");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor Ipsum. sit ipsum.",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum.", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem ipsum dolor sit sit sit ");
      });
    });

    it("works when surrounded by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem 'Ipsum' dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "'Ipsum'", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("does not affect query words surrounded by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem 'Ipsum' dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem 'Ipsum' dolor");
      });
    });
  });

  describe("'case' and 'wholeWord' query patterns together", () => {
    it("works for single words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor sIpsum ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["case", "wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor sIpsum ipsum");
      });
    });

    it("works for single words with query patterns in a different order", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor sIpsum ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["wholeWord", "case"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor sIpsum ipsum");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor sIpsum Ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["case", "wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor sIpsum sit ");
      });
    });
  });
});
