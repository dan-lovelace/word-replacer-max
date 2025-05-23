import { selectors as s } from "../support/selectors";

import { searchAndReplace } from "./replace/lib";

describe("replaceText", () => {
  describe("default query pattern", () => {
    it("works for single words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", [], "sit");
        cy.wrap(target).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "lorem ipsum", [], "sit");
        cy.wrap(target).should("have.text", "sit dolor");
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
        cy.wrap(target).should("have.text", "Lorem sit sit sit amet");
      });
    });

    it("works for queries with punctuation", () => {
      cy.visitMock({
        targetContents: "Let's ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Let's", [], "Lorem");
        cy.wrap(target).should("have.text", "Lorem ipsum");
      });
    });

    it("works for whitespace replacements", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", [], " ");
        cy.wrap(target).should("have.text", "Lorem   dolor");
      });
    });

    it("does not replace when replacement is empty", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", [], "");
        cy.wrap(target).should("have.text", "Lorem ipsum dolor");
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
        cy.wrap(target)
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
        cy.wrap(target).should("have.text", "Lositrem Ipsum");
      });
    });

    it("does not respect regular expression characters", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Lo.*", [], "sit");
        cy.wrap(target).should("have.text", "Lorem ipsum dolor");
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
        cy.wrap(target).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor Ipsum sit ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", ["case"], "sit");
        cy.wrap(target).should("have.text", "Lorem sit dolor Ipsum sit sit");
      });
    });

    it("does not respect regular expression characters", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Lo.*", ["case"], "sit");
        cy.wrap(target).should("have.text", "Lorem ipsum dolor");
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
        cy.wrap(target).should("have.text", "Lorem sit dolor");
      });
    });

    it("works with basic patterns 2", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum.*", ["regex"], "sit");
        cy.wrap(target).should("have.text", "Lorem sit");
      });
    });

    it("works with basic patterns 3", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "^(Lo)+rem[\\s]+i{1}", ["regex"], "sit");
        cy.wrap(target).should("have.text", "sitpsum dolor");
      });
    });

    it("works with backreferences", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "(Lorem)|(ipsum)", ["regex"], "$1,updated");
        cy.wrap(target).should("have.text", "Lorem,updated ,updated dolor");
      });
    });

    it("works with leading word boundary", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "\\blorem", ["regex"], "sit");
        cy.wrap(target).should("have.text", "sit ipsum dolor");
      });
    });

    it("works with leading word boundary into capture group", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "\\b(lorem)", ["regex"], "sit");
        cy.wrap(target).should("have.text", "sit ipsum dolor");
      });
    });

    it("works with trailing word boundary", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "lorem\\b", ["regex"], "sit");
        cy.wrap(target).should("have.text", "sit ipsum dolor");
      });
    });

    it("works with trailing word boundary after capture group", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "(lorem)\\b", ["regex"], "sit");
        cy.wrap(target).should("have.text", "sit ipsum dolor");
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
        cy.wrap(target).should("have.text", "Lorem ipsum dolor sit");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor Ipsum. sit ipsum.",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum.", ["wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem ipsum dolor sit sit sit");
      });
    });

    it("works when followed by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum, dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "ipsum", ["wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem sit, dolor");
      });
    });

    it("works with queries surrounded by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem 'Ipsum' dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "'Ipsum'", ["wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem sit dolor");
      });
    });

    it("works with replacements surrounded by punctuation", () => {
      cy.visitMock({
        targetContents: "Lorem 'Ipsum' dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem 'sit' dolor");
      });
    });

    it("does not respect regular expression characters", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Lo.*", ["wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem ipsum dolor");
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
        cy.wrap(target).should("have.text", "Lorem sit dolor sIpsum ipsum");
      });
    });

    it("works for single words with query patterns in a different order", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor sIpsum ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["wholeWord", "case"], "sit");
        cy.wrap(target).should("have.text", "Lorem sit dolor sIpsum ipsum");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock({
        targetContents: "Lorem Ipsum dolor sIpsum Ipsum",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Ipsum", ["case", "wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem sit dolor sIpsum sit");
      });
    });

    it("does not respect regular expression characters", () => {
      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      s.target().then(($element) => {
        const target = $element.get(0);

        searchAndReplace(target, "Lo.*", ["case", "wholeWord"], "sit");
        cy.wrap(target).should("have.text", "Lorem ipsum dolor");
      });
    });
  });
});
