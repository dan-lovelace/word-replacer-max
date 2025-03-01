import { IngestionEngine } from "@worm/content/src/lib/ingestion";
import { TestBrowser } from "@worm/testing";
import { RuntimeMessage } from "@worm/types/src/message";
import { SyncStorageNew } from "@worm/types/src/storage";

type RequestMessage = RuntimeMessage<"htmlReplaceRequest">;

const testStorage: SyncStorageNew = {
  domainList: [],
  exportLinks: [],
  preferences: {
    activeTab: "rules",
    domainListEffect: "deny",
    extensionEnabled: true,
    focusRule: {
      field: "queries",
      matcher: "",
    },
  },
  replacementStyle: {
    active: false,
    backgroundColor: "",
    color: "",
    options: [],
  },
  replacementSuggest: {
    active: false,
  },
  ruleGroups: {
    active: false,
  },
  storageVersion: "1.0.0",
};

const browser = new TestBrowser({
  withStorage: {
    sync: testStorage,
  },
});

async function waitForResponse(): Promise<RequestMessage> {
  return new Promise<RequestMessage>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for response"));
    }, 2000);

    browser.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener((message) => {
        const event = message as RequestMessage;

        clearTimeout(timeout);
        resolve(event);
      });
    });

    cy.window().then(($win) => {
      new IngestionEngine({
        browser,
        startNode: $win.document.documentElement,
        storageArea: "sync",
      });
    });
  });
}

describe("replacement requests", () => {
  it("should send request on document load", () => {
    cy.visitMock({
      targetContents: "<p>Test <strong>this</strong> thing</p>",
    });

    cy.wrap<Promise<RequestMessage>, RequestMessage>(waitForResponse()).then(
      (res) => {
        expect(res.data.details?.strings.length).to.eq(2);
        expect(res.data.kind).to.eq("htmlReplaceRequest");
        expect(res.data.targets?.length).to.eq(1);
        expect(res.data.targets?.[0]).to.eq("background");
      }
    );
  });
});
