import { replace } from "@worm/shared/src/replace";

import { selectors as s } from "../lib/selectors";

describe("replace", () => {
  describe("default query pattern", () => {
    it("works for single words", () => {
      cy.visitMock();

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "ipsum", [], "sit");
        cy.wrap($element).should("have.text", "Lorem sit dolor");
      });
    });

    it("works for multiple words", () => {
      cy.visitMock();

      s.target().then(($element) => {
        const target = $element.get(0);

        replace(target, "lorem ipsum", [], "sit");
        cy.wrap($element).should("have.text", "sit dolor");
      });
    });

    it("does not affect element attributes", () => {
      cy.visitMock({
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
});
