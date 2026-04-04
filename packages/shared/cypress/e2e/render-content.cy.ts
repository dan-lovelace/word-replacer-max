import { Browser } from "webextension-polyfill";

import { Renderer } from "@worm/shared/src/browser/render";
import testBrowser from "@worm/testing/src/test-browser";
import { RenderRate } from "@worm/types/src/rules";

import { DEFAULT_RENDER_RATE_MS } from "../../src/replace/lib/render";

import { selectors } from "../support/selectors";
import { InputReplacement } from "@worm/types/src/replace";
import { SyncStorage } from "@worm/types/src/storage";

const browser = testBrowser as Browser;

describe("render content", () => {
  describe("non-input elements", () => {
    beforeEach(() => {
      browser.storage.sync.set({
        matcher__1234: {
          active: true,
          identifier: "1234",
          queries: ["ipsum"],
          queryPatterns: [],
          replacement: "sit",
        },
      });

      cy.visitMock({
        targetContents: "Lorem ipsum dolor",
      });

      cy.wait(50);
    });

    it("re-runs replacements when page content changes", () => {
      cy.document().then(($doc) => {
        const renderer = new Renderer(browser, $doc.documentElement);

        // wait for document ready state render
        cy.wait(DEFAULT_RENDER_RATE_MS + 10);

        // change the target element's text to trigger a mutation observer event
        selectors.target().then(($target) => {
          $target[0].textContent = "Lorem ipsum dolor sit";
        });

        // this runs before the mutation occurs, ensure it hasn't been replaced yet
        selectors
          .target()
          .contains("Lorem ipsum dolor sit")
          .then(() => {
            expect(renderer.renderCount).to.equal(1);
          });

        // use cypress inherent waits to wait for the mutation
        selectors
          .target()
          .contains("Lorem sit dolor sit")
          .then(() => {
            expect(renderer.renderCount).to.equal(2);
          });
      });
    });

    it("runs replacements on page load", async () => {
      cy.document().then(($doc) => {
        new Renderer(browser, $doc.documentElement);

        selectors.target().contains("Lorem sit dolor");
      });
    });

    it("does not re-run replacements faster than user preferences", () => {
      const testFrequency = 200;

      const newRenderRate: RenderRate = {
        active: true,
        frequency: testFrequency,
      };

      cy.document().then(($doc) => {
        const renderer = new Renderer(browser, $doc.documentElement);

        // updating storage renders content immediately - Call 1
        browser.storage.sync
          .set({
            renderRate: newRenderRate,
          })
          .then(() => {
            // change the target element's text to trigger a mutation observer event - Call 2
            selectors.target().then(($target) => {
              $target[0].textContent = "An updated string";
            });

            const start = Date.now();

            // this runs before the mutation occurs, ensure it hasn't been replaced yet
            selectors
              .target()
              .contains("An updated string")
              .then(() => {
                expect(renderer.renderCount).to.equal(2);
              });

            // change text again faster than test frequency - No call!
            selectors.target().then(($target) => {
              $target[0].textContent = "Lorem ipsum dolor sit";
            });

            // use cypress inherent waits to wait for the mutation - Call 3
            selectors
              .target()
              .contains("Lorem sit dolor sit")
              .then(() => {
                expect(renderer.renderCount).to.equal(3);

                const end = Date.now();
                const total = end - start;

                expect(total).greaterThan(testFrequency);
              });
          });
      });
    });

    it("does not use user frequency preferences when feature is disabled", () => {
      const testFrequency = 200;

      const newRenderRate: RenderRate = {
        active: false,
        frequency: testFrequency,
      };

      cy.document().then(($doc) => {
        const renderer = new Renderer(browser, $doc.documentElement);

        // updating storage renders content immediately - Call 1
        browser.storage.sync
          .set({
            renderRate: newRenderRate,
          })
          .then(() => {
            // change the target element's text to trigger a mutation observer event - Call 2
            selectors.target().then(($target) => {
              $target[0].textContent = "An updated string";
            });

            const start = Date.now();

            // this runs before the mutation occurs, ensure it hasn't been replaced yet
            selectors
              .target()
              .contains("An updated string")
              .then(() => {
                expect(renderer.renderCount).to.equal(2);
              });

            // wait the default amount of time plus a little
            cy.wait(DEFAULT_RENDER_RATE_MS + 10);

            // change text again faster than test frequency - Call 3
            selectors.target().then(($target) => {
              $target[0].textContent = "Lorem ipsum dolor sit";
            });

            // use cypress inherent waits to wait for the mutation - Call 4
            selectors
              .target()
              .contains("Lorem sit dolor sit")
              .then(() => {
                expect(renderer.renderCount).to.equal(4);

                const end = Date.now();
                const total = end - start;

                expect(total).lessThan(testFrequency);
              });
          });
      });
    });
  });

  describe("input replacements", () => {
    const defaultPreferences: SyncStorage["preferences"] = {
      activeTab: "rules",
      focusRule: {
        field: "replacement",
        matcher: "",
      },
      domainListEffect: "deny",
      extensionEnabled: true,
      inputReplacement: {
        active: true,
        mode: "real-time",
      },
    };

    it("replaces text inputs on page load when the preference is active", () => {
      browser.storage.sync.set({
        matcher__1234: {
          active: true,
          identifier: "1234",
          queries: ["ipsum"],
          queryPatterns: [],
          replacement: "sit",
        },
        preferences: defaultPreferences,
      });

      cy.visitMock({
        bodyContents:
          '<input data-testid="target" value="Lorem ipsum dolor" />',
      });
      cy.wait(50);

      cy.document().then(($doc) => {
        new Renderer(browser, $doc.documentElement);
        selectors.target().should("have.value", "Lorem sit dolor");
      });
    });

    it("replaces 'contenteditable' elements on page load when the preference is active", () => {
      browser.storage.sync.set({
        matcher__1234: {
          active: true,
          identifier: "1234",
          queries: ["ipsum"],
          queryPatterns: [],
          replacement: "sit",
        },
        preferences: defaultPreferences,
      });

      cy.visitMock({
        bodyContents:
          '<div data-testid="target" contenteditable>Lorem ipsum dolor</div>',
      });
      cy.wait(50);

      cy.document().then(($doc) => {
        new Renderer(browser, $doc.documentElement);
        selectors.target().should("have.text", "Lorem sit dolor");
      });
    });

    it("does not replace text inputs on page load when the preference is active and the mode is not 'real-time'", () => {
      browser.storage.sync.set({
        matcher__1234: {
          active: true,
          identifier: "1234",
          queries: ["ipsum"],
          queryPatterns: [],
          replacement: "sit",
        },
        preferences: {
          ...defaultPreferences,
          inputReplacement: {
            active: true,
            mode: "on-demand",
          },
        },
      });

      cy.visitMock({
        bodyContents:
          '<input data-testid="target" value="Lorem ipsum dolor" />',
      });
      cy.wait(50);

      cy.document().then(($doc) => {
        new Renderer(browser, $doc.documentElement);

        cy.wait(50);
        selectors.target().should("have.value", "Lorem ipsum dolor");
      });
    });

    it("does not replace text inputs on page load when the preference is not active", () => {
      browser.storage.sync.set({
        matcher__1234: {
          active: true,
          identifier: "1234",
          queries: ["ipsum"],
          queryPatterns: [],
          replacement: "sit",
        },
        preferences: {
          ...defaultPreferences,
          inputReplacement: {
            active: false,
            mode: "real-time",
          },
        },
      });

      cy.visitMock({
        bodyContents:
          '<input data-testid="target" value="Lorem ipsum dolor" />',
      });
      cy.wait(50);

      cy.document().then(($doc) => {
        new Renderer(browser, $doc.documentElement);

        cy.wait(50);
        selectors.target().should("have.value", "Lorem ipsum dolor");
      });
    });

    it("does not replace 'contenteditable' elements on page load when the preference is not active", () => {
      browser.storage.sync.set({
        matcher__1234: {
          active: true,
          identifier: "1234",
          queries: ["ipsum"],
          queryPatterns: [],
          replacement: "sit",
        },
        preferences: {
          ...defaultPreferences,
          inputReplacement: {
            active: false,
            mode: "real-time",
          },
        },
      });

      cy.visitMock({
        bodyContents:
          '<div data-testid="target" contenteditable>Lorem ipsum dolor</div>',
      });
      cy.wait(50);

      cy.document().then(($doc) => {
        new Renderer(browser, $doc.documentElement);

        cy.wait(50);
        selectors.target().should("have.text", "Lorem ipsum dolor");
      });
    });
  });
});
