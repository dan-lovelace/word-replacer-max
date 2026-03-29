import { replaceAllInputElements } from "../../src/replace/replace-input";

import { selectors as s } from "../support/selectors";

describe("replaceAllInputElements", () => {
  describe("default query pattern", () => {
    it("replaces inputs with undefined type", () => {
      cy.visitMock({
        bodyContents: `
          <input data-testid="target" value="Lorem ipsum dolor" />
        `,
      });

      cy.document().then((document) => {
        replaceAllInputElements(
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

        s.target().should("have.value", "Lorem sit dolor");
      });
    });

    it("replaces input elements whose type is in VALUE_INPUT_SELECTOR", () => {
      cy.visitMock({
        bodyContents: `
          <input data-testid="email-input" type="email" value="hello@ipsum.com" />
          <input data-testid="search-input" type="search" value="Lorem ipsum dolor" />
          <input data-testid="tel-input" type="tel" value="ipsum-555-1234" />
          <input data-testid="url-input" type="url" value="https://ipsum.example.com" />
        `,
      });

      cy.document().then((document) => {
        replaceAllInputElements(
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

        cy.findByTestId("email-input").should("have.value", "hello@sit.com");
        cy.findByTestId("search-input").should("have.value", "Lorem sit dolor");
        cy.findByTestId("tel-input").should("have.value", "sit-555-1234");
        cy.findByTestId("url-input").should(
          "have.value",
          "https://sit.example.com"
        );
      });
    });

    it("does not replace input elements whose type is not in VALUE_INPUT_SELECTOR", () => {
      cy.visitMock({
        bodyContents: `
          <input data-testid="number-input" type="number" value="42" />
          <input data-testid="password-input" type="password" value="ipsum-secret" />
          <input data-testid="checkbox-input" type="checkbox" value="Lorem ipsum" />
          <input data-testid="submit-input" type="submit" value="Lorem ipsum" />
        `,
      });

      cy.document().then((document) => {
        replaceAllInputElements(
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

        cy.findByTestId("number-input").should("have.value", "42");
        cy.findByTestId("password-input").should(
          "have.value",
          "ipsum-secret"
        );
        cy.findByTestId("checkbox-input").should("have.value", "Lorem ipsum");
        cy.findByTestId("submit-input").should("have.value", "Lorem ipsum");
      });
    });

    it("replaces textarea elements", () => {
      cy.visitMock({
        bodyContents: `
          <textarea data-testid="target">Lorem ipsum dolor</textarea>
        `,
      });

      cy.document().then((document) => {
        replaceAllInputElements(
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

        s.target().should("have.value", "Lorem sit dolor");
      });
    });

    it("replaces contenteditable elements", () => {
      cy.visitMock({
        bodyContents: `
          <div data-testid="target" contenteditable="true">Lorem ipsum dolor</div>
        `,
      });

      cy.document().then((document) => {
        replaceAllInputElements(
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
      });
    });

    it("replaces content inside design mode iframes", () => {
      cy.visitMock({
        bodyContents: `
          <iframe data-testid="target-iframe"></iframe>
        `,
      });

      cy.document().then((document) => {
        const iframe = document.querySelector<HTMLIFrameElement>(
          '[data-testid="target-iframe"]'
        )!;

        iframe.contentDocument!.body.textContent = "Lorem ipsum dolor";
        iframe.contentDocument!.designMode = "on";

        replaceAllInputElements(
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

        cy.wrap(iframe.contentDocument!.body.textContent).should(
          "equal",
          "Lorem sit dolor"
        );
      });
    });
  });
});
