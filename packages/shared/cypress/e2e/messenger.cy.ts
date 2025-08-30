import { Browser } from "webextension-polyfill";

import { createWebAppMessage } from "@worm/shared/src/messaging";
import { Messenger } from "@worm/shared/src/replace/messenger";
import testBrowser from "@worm/testing/src/test-browser";
import {
  ReplacementMessageItem,
  WebAppMessageData,
} from "@worm/types/src/message";

const TEST_UUID = "e8347f40-2466-42d2-9645-bb1b4be9fcf2";

const browser = testBrowser as Browser;

const buildRuntimeResponse = (
  items?: ReplacementMessageItem[]
): WebAppMessageData<"processReplacementsResponse"> => ({
  kind: "processReplacementsResponse",
  details: {
    data: items ?? [
      {
        id: `${TEST_UUID}-0`,
        createdAt: Date.now(),
        html: "updated",
      },
    ],
  },
});

const webExtensionHandler = async (messages: ReplacementMessageItem[]) => {
  const replacementRequest = createWebAppMessage(
    "processReplacementsRequest",
    messages
  );

  const result = await browser.runtime.sendMessage<
    WebAppMessageData<"processReplacementsRequest">,
    WebAppMessageData<"processReplacementsResponse">
  >(replacementRequest);

  return result.details?.data;
};

describe("Messenger", () => {
  const NOW = Date.now();

  beforeEach(() => {
    cy.stub(crypto, "randomUUID").as("randomID").returns(TEST_UUID);
  });

  it("should handle empty element arrays gracefully", () => {
    const callbackSpy = cy.spy().as("callbackSpy");
    const messenger = new Messenger(webExtensionHandler, callbackSpy);

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
      const messenger = new Messenger(webExtensionHandler, callbackSpy);

      const runtimeResponse = buildRuntimeResponse();
      cy.stub(browser.runtime, "sendMessage").resolves(runtimeResponse);

      cy.wrap(messenger.sendReplacementRequest([testElement])).then(() => {
        cy.wrap(browser.runtime.sendMessage)
          .should("have.been.calledOnce")
          .then(() => {
            cy.get("@callbackSpy").should("have.been.calledWith", [
              { ...runtimeResponse.details?.data?.[0], element: testElement },
            ]);
          });
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
      const messenger = new Messenger(webExtensionHandler, callbackSpy);

      const runtimeResponse = buildRuntimeResponse([
        {
          id: `${TEST_UUID}-0`,
          createdAt: NOW,
          html: "updated 1",
        },
        {
          id: `nonexistent-id`,
          createdAt: NOW,
          html: "updated 2",
        },
      ]);
      cy.stub(browser.runtime, "sendMessage").resolves(runtimeResponse);

      cy.wrap(
        messenger.sendReplacementRequest([testElement1, testElement2])
      ).then(() => {
        cy.get("@callbackSpy").should("have.been.calledWith", [
          { ...runtimeResponse.details?.data?.[0], element: testElement1 },
        ]);
      });

      cy.then(() => {
        testElement1.remove();
        testElement2.remove();
      });
    });
  });

  it("should handle browser.runtime.sendMessage returning empty", () => {
    cy.document().then(($document) => {
      const testElement = $document.createElement("div");
      testElement.innerHTML = "This is a test element";
      $document.body.appendChild(testElement);

      const callbackSpy = cy.spy().as("callbackSpy");
      const messenger = new Messenger(webExtensionHandler, callbackSpy);

      const runtimeResponse = buildRuntimeResponse([]);
      cy.stub(browser.runtime, "sendMessage").resolves(runtimeResponse);

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
      const messenger = new Messenger(webExtensionHandler, callbackSpy);

      const runtimeResponse = buildRuntimeResponse([
        {
          id: `${TEST_UUID}-0`,
          createdAt: NOW,
          html: "updated 1",
        },
        {
          id: `${TEST_UUID}-1`,
          createdAt: NOW,
          html: "updated 2",
        },
      ]);
      cy.stub(browser.runtime, "sendMessage").resolves(runtimeResponse);

      cy.wrap(
        messenger.sendReplacementRequest([testElement, testElement])
      ).then(() => {
        cy.get("@callbackSpy").should("have.been.calledWith", [
          { ...runtimeResponse.details?.data?.[1], element: testElement },
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
      const messenger = new Messenger(webExtensionHandler, callbackSpy);

      const firstTimestamp = NOW;
      const secondTimestamp = NOW + 100;

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
      cy.get("@randomID")
        .invoke("restore")
        .then(() => {
          cy.stub(crypto, "randomUUID").as("dateFirst").returns(firstTimestamp);
          const firstRequest = messenger.sendReplacementRequest([testElement]);

          // send second request (newer timestamp)
          cy.get("@dateFirst")
            .invoke("restore")
            .then(() => {
              cy.stub(crypto, "randomUUID").returns(secondTimestamp);
              const secondRequest = messenger.sendReplacementRequest([
                testElement,
              ]);

              // resolve the second (newer) request first
              const secondResponse = buildRuntimeResponse([
                {
                  id: `${secondTimestamp}-0`,
                  createdAt: secondTimestamp,
                  html: "Newer update",
                },
              ]);
              secondResolver?.(secondResponse);

              // wait for second request to complete
              cy.wrap(secondRequest).then(() => {
                // callback should be called with the newer response
                cy.get("@callbackSpy").should("have.been.calledOnce");
                cy.get("@callbackSpy").should("have.been.calledWith", [
                  {
                    ...secondResponse.details?.data?.[0],
                    element: testElement,
                  },
                ]);
              });

              // now resolve the first (older) request
              const firstResponse = buildRuntimeResponse([
                {
                  id: `${firstTimestamp}-0`,
                  createdAt: firstTimestamp,
                  html: "Older update",
                },
              ]);
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
