import { Browser } from "webextension-polyfill";

import { Messenger } from "@worm/shared/src/replace/messenger";
import testBrowser from "@worm/testing/src/test-browser";

const browser = testBrowser as Browser;

describe("Messenger", () => {
  const FIXED_TIMESTAMP = 1735689600000;

  beforeEach(() => {
    cy.stub(Date, "now").as("dateNow").returns(FIXED_TIMESTAMP);
  });

  it("should handle empty element arrays gracefully", () => {
    const callbackSpy = cy.spy().as("callbackSpy");
    const messenger = new Messenger(browser, callbackSpy);

    cy.wrap(messenger.sendReplacementRequest([])).then(() => {
      cy.get("@callbackSpy").should("not.have.been.called");
    });
  });

  it("should process single element correctly", () => {
    cy.document().then(($document) => {
      const testElement = $document.createElement("div");
      testElement.innerHTML = "This is a test element";
      $document.body.appendChild(testElement);

      const callbackSpy = cy.spy().as("callbackSpy");
      const messenger = new Messenger(browser, callbackSpy);

      const mockResponse = [
        {
          id: `${FIXED_TIMESTAMP}-0`, // id's are time-based
          createdAt: FIXED_TIMESTAMP,
          html: "updated",
        },
      ];
      cy.stub(browser.runtime, "sendMessage").resolves(mockResponse);

      cy.wrap(messenger.sendReplacementRequest([testElement])).then(() => {
        cy.wrap(browser.runtime.sendMessage).should("have.been.calledOnce"); // stubbed previously
        cy.get("@callbackSpy").should("have.been.calledWith", mockResponse);
      });

      cy.then(() => {
        testElement.remove();
      });
    });
  });

  it("should ignore responses for elements no longer in queue", () => {
    cy.document().then(($document) => {
      const testElement1 = $document.createElement("div");
      testElement1.innerHTML = "This is a test element 1";
      $document.body.appendChild(testElement1);

      const testElement2 = $document.createElement("div");
      testElement2.innerHTML = "This is a test element 2";
      $document.body.appendChild(testElement2);

      const callbackSpy = cy.spy().as("callbackSpy");
      const messenger = new Messenger(browser, callbackSpy);

      const runtimeResponse = [
        {
          id: `${FIXED_TIMESTAMP}-0`,
          createdAt: FIXED_TIMESTAMP,
          html: "updated 1",
        },
        {
          id: `nonexistent-id`,
          createdAt: FIXED_TIMESTAMP,
          html: "updated 2",
        },
      ];
      cy.stub(browser.runtime, "sendMessage").resolves(runtimeResponse);

      cy.wrap(
        messenger.sendReplacementRequest([testElement1, testElement2])
      ).then(() => {
        cy.get("@callbackSpy").should("have.been.calledWith", [
          runtimeResponse[0],
        ]);
      });

      cy.then(() => {
        testElement1.remove();
        testElement2.remove();
      });
    });
  });

  it("should handle browser.runtime.sendMessage returning null/undefined", () => {
    cy.document().then(($document) => {
      const testElement = $document.createElement("div");
      testElement.innerHTML = "This is a test element";
      $document.body.appendChild(testElement);

      const callbackSpy = cy.spy().as("callbackSpy");
      const messenger = new Messenger(browser, callbackSpy);

      cy.stub(browser.runtime, "sendMessage").resolves(null);

      cy.wrap(messenger.sendReplacementRequest([testElement])).then(() => {
        cy.get("@callbackSpy").should("not.have.been.called");
      });

      cy.then(() => {
        testElement.remove();
      });
    });
  });

  it("should deduplicate elements in the same request", () => {
    cy.document().then(($document) => {
      const testElement = $document.createElement("div");
      testElement.innerHTML = "This is a test element";
      $document.body.appendChild(testElement);

      const callbackSpy = cy.spy().as("callbackSpy");
      const messenger = new Messenger(browser, callbackSpy);

      const runtimeResponse = [
        {
          id: `${FIXED_TIMESTAMP}-0`,
          createdAt: FIXED_TIMESTAMP,
          html: "updated 1",
        },
        {
          id: `${FIXED_TIMESTAMP}-1`,
          createdAt: FIXED_TIMESTAMP,
          html: "updated 2",
        },
      ];
      cy.stub(browser.runtime, "sendMessage").resolves(runtimeResponse);

      cy.wrap(
        messenger.sendReplacementRequest([testElement, testElement])
      ).then(() => {
        cy.get("@callbackSpy").should("have.been.calledWith", [
          runtimeResponse[0],
        ]);
      });

      cy.then(() => {
        testElement.remove();
      });
    });
  });

  it("should prefer the latest message when requests return out of order", () => {
    cy.document().then(($document) => {
      const testElement = $document.createElement("div");
      testElement.innerHTML = "Original content";
      $document.body.appendChild(testElement);

      const callbackSpy = cy.spy().as("callbackSpy");
      const messenger = new Messenger(browser, callbackSpy);

      const firstTimestamp = FIXED_TIMESTAMP;
      const secondTimestamp = FIXED_TIMESTAMP + 100;

      let firstResolver: ((value: unknown) => void) | undefined,
        secondResolver: ((value: unknown) => void) | undefined;

      let callCount = 0;
      cy.stub(browser.runtime, "sendMessage").callsFake(() => {
        callCount++;
        return callCount === 1
          ? new Promise((resolve) => (firstResolver = resolve))
          : new Promise((resolve) => (secondResolver = resolve));
      });

      // send first request
      cy.get("@dateNow")
        .invoke("restore")
        .then(() => {
          cy.stub(Date, "now").as("dateFirst").returns(firstTimestamp);
          const firstRequest = messenger.sendReplacementRequest([testElement]);

          // send second request (newer timestamp)
          cy.get("@dateFirst")
            .invoke("restore")
            .then(() => {
              cy.stub(Date, "now").returns(secondTimestamp);
              const secondRequest = messenger.sendReplacementRequest([
                testElement,
              ]);

              // resolve the second (newer) request first
              const secondResponse = [
                {
                  id: `${secondTimestamp}-0`,
                  createdAt: secondTimestamp,
                  html: "Newer update",
                },
              ];
              secondResolver?.(secondResponse);

              // wait for second request to complete
              cy.wrap(secondRequest).then(() => {
                // callback should be called with the newer response
                cy.get("@callbackSpy").should("have.been.calledOnce");
                cy.get("@callbackSpy").should(
                  "have.been.calledWith",
                  secondResponse
                );
              });

              // now resolve the first (older) request
              const firstResponse = [
                {
                  id: `${firstTimestamp}-0`,
                  createdAt: firstTimestamp,
                  html: "Older update",
                },
              ];
              firstResolver?.(firstResponse);

              // wait for first request to complete and verify it's ignored
              cy.wrap(firstRequest).then(() => {
                // callback should still only have been called once (older message ignored)
                cy.get("@callbackSpy").should("have.been.calledOnce");
              });

              cy.then(() => {
                testElement.remove();
              });
            });
        });
    });
  });
});
