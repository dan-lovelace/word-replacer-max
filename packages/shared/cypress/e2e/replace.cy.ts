import { replace } from "@worm/shared/src/replace";

import { selectors as s } from "../lib/selectors";

describe("replace", () => {
  describe("default query pattern", () => {
    it("works for single words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "ipsum", [], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "lorem ipsum", [], "sit");
        cy.wrap($element).should("have.text", "sit dolor");
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

        replace(target, "ipsum", [], "sit");
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

        replace(target, "Lo", [], "Losit");
        replace(target, "Lo", [], "Losit");
        replace(target, "Lo", [], "Losit");
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

        replace(target, "ipsum", ["case"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor Ipsum sit ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "ipsum", ["case"], "sit");
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

        replace(target, "ipsum", ["regex"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works with basic patterns 2", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "ipsum.*", ["regex"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit");
      });
    });

    it("works with advanced patterns", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "^(Lo)+rem[\\s]+i{1}", ["regex"], "sit");
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

        replace(target, "ipsum.", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem ipsum dolor sit");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor Ipsum. sit ipsum.",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "ipsum.", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem ipsum dolor sit sit sit");
      });
    });

    it("works when surrounded by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem 'Ipsum' dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "'Ipsum'", ["wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("does not affect query words surrounded by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem 'Ipsum' dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "Ipsum", ["wholeWord"], "sit");
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

        replace(target, "Ipsum", ["case", "wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor sIpsum ipsum");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor sIpsum Ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "Ipsum", ["case", "wholeWord"], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor sIpsum sit");
      });
    });
  });
});
