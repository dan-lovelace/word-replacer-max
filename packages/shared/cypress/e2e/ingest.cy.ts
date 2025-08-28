import { Ingest } from "@worm/shared/src/replace/ingest";

const querySelectors: Record<string, (document: Document) => HTMLElement> = {
  subTarget: (document) =>
    document.querySelector("[data-testid='sub-target']")!,
  target: (document) => document.querySelector("[data-testid='target']")!,
};

describe("ingest", () => {
  it("should push single items to the queue", () => {
    cy.visitMock({ targetContents: "Lorem ipsum dolor" });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      cy.get("@handleItems").should("have.been.calledOnce");
      cy.wrap(found).should("have.length", 1);
      cy.wrap(found[0]).should("eq", querySelectors.target($document));
    });
  });

  it("should push multiple items to the queue", () => {
    cy.visitMock({
      targetContents: 'Lorem <span data-testid="sub-target">ipsum</span> dolor',
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      cy.get("@handleItems").should("have.been.calledOnce");
      cy.wrap(found).should("have.length", 2);
      cy.wrap(found[0]).should("eq", querySelectors.target($document));
      cy.wrap(found[1]).should("eq", querySelectors.subTarget($document));
    });
  });

  it("should batch pushes to the queue", () => {
    const batchSize = 20;
    const testCount = 100;
    const targetContents = Array.from({ length: testCount })
      .map(() => "<span>Lorem ipsum dolor</span>")
      .join("\n");

    cy.visitMock({ targetContents });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems, {
        batchSize,
      });
      ingest.start();

      cy.get("@handleItems").should("have.callCount", 5);
      cy.wrap(found).should("have.length", testCount);
    });
  });

  it("should push references of found elements", () => {
    cy.visitMock({
      targetContents: 'Lorem <span data-testid="sub-target">ipsum</span> dolor',
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      cy.get("@handleItems").should("have.been.calledOnce");
      cy.wrap(found)
        .should("have.length", 2)
        .then(() => {
          cy.wrap(found[0]).should("eq", querySelectors.target($document));
          cy.wrap(found[1]).should("eq", querySelectors.subTarget($document));
        });
    });
  });

  it("should push references of mutated elements", () => {
    cy.visitMock({
      targetContents: 'Lorem <span data-testid="sub-target">ipsum</span> dolor',
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      querySelectors.subTarget($document).textContent = "sit";

      cy.get("@handleItems").should("have.been.calledTwice");
      cy.wrap(found)
        .should("have.length", 3)
        .then(() => {
          cy.wrap(found[0]).should("eq", querySelectors.target($document));
          cy.wrap(found[1]).should("eq", querySelectors.subTarget($document));
          cy.wrap(found[2]).should("eq", querySelectors.subTarget($document));
        });
    });
  });

  it("should push textContent mutations", () => {
    cy.visitMock({
      targetContents: 'Lorem <span data-testid="sub-target">ipsum</span> dolor',
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      querySelectors.subTarget($document).textContent = "sit";

      cy.get("@handleItems").should("have.been.calledTwice");
    });
  });

  it("should push innerHTML mutations", () => {
    cy.visitMock({
      targetContents: 'Lorem <span data-testid="sub-target">ipsum</span> dolor',
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      querySelectors.subTarget($document).innerHTML = "sit";

      cy.get("@handleItems").should("have.been.calledTwice");
    });
  });

  it("should push subtree mutations", () => {
    cy.visitMock({
      targetContents: "Lorem ipsum dolor",
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems);
      ingest.start();

      const newElement = $document.createElement("div");
      newElement.innerHTML = "A new element";

      querySelectors.target($document).appendChild(newElement);

      cy.get("@handleItems")
        .should("have.callCount", 2)
        .then(() => {
          cy.wrap(found).should("have.length", 2);
          cy.wrap(found[1]).should("eq", newElement);
        });
    });
  });

  it("should not push ignored elements", () => {
    cy.visitMock({
      targetContents: "<script>Lorem ipsum dolor</script>",
    });

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document.documentElement, handleItems, {
        ignoreElements: new Set<keyof HTMLElementTagNameMap>(["script"]),
      });
      ingest.start();

      cy.get("@handleItems").should("not.have.been.called");
      cy.wrap(found).should("have.length", 0);
    });
  });
});
