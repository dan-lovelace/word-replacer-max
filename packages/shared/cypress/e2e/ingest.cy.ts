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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          cy.wrap(found).should("have.length", 1);
          cy.wrap(found[0]).should("eq", querySelectors.target($document));
        });
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          cy.wrap(found).should("have.length", 2);
          cy.wrap(found[0]).should("eq", querySelectors.target($document));
          cy.wrap(found[1]).should("eq", querySelectors.subTarget($document));
        });
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

      const ingest = new Ingest($document, handleItems, {
        batchSize,
      });
      ingest.start();

      cy.get("@handleItems")
        .should("have.callCount", 5)
        .then(() => {
          cy.wrap(found).should("have.length", testCount);
        });
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          cy.wrap(found)
            .should("have.length", 2)
            .then(() => {
              cy.wrap(found[0]).should("eq", querySelectors.target($document));
              cy.wrap(found[1]).should(
                "eq",
                querySelectors.subTarget($document)
              );
            });
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          querySelectors.subTarget($document).textContent = "sit";

          cy.get("@handleItems")
            .should("have.been.calledTwice")
            .then(() => {
              cy.wrap(found)
                .should("have.length", 3)
                .then(() => {
                  cy.wrap(found[0]).should(
                    "eq",
                    querySelectors.target($document)
                  );
                  cy.wrap(found[1]).should(
                    "eq",
                    querySelectors.subTarget($document)
                  );
                  cy.wrap(found[2]).should(
                    "eq",
                    querySelectors.subTarget($document)
                  );
                });
            });
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          querySelectors.subTarget($document).textContent = "sit";

          cy.get("@handleItems").should("have.been.calledTwice");
        });
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          querySelectors.subTarget($document).innerHTML = "sit";

          cy.get("@handleItems").should("have.been.calledTwice");
        });
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          const newElement = $document.createElement("div");
          newElement.innerHTML = "A new element";

          querySelectors.target($document).appendChild(newElement);

          cy.get("@handleItems")
            .should("have.been.calledTwice")
            .then(() => {
              cy.wrap(found).should("have.length", 2);
              cy.wrap(found[0]).should("eq", querySelectors.target($document));
              cy.wrap(found[1]).should("eq", newElement);
            });
        });
    });
  });

  it("should not push attribute mutations", () => {
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          querySelectors.subTarget($document).classList.add("sit");

          cy.get("@handleItems").should("have.been.calledOnce");
          cy.wrap(found).should("have.length", 2);
        });
    });
  });

  it("should batch mutations according to maximum batch size", () => {
    cy.visitMock();

    cy.document().then(($document) => {
      const found: HTMLElement[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          found.push(...items);
        })
        .as("handleItems");

      const ingest = new Ingest($document, handleItems, {
        batchSize: 100,
        ignoreElements: new Set<keyof HTMLElementTagNameMap>(["script"]),
      });
      ingest.start();

      const testCount = 1000;
      const promises = Array.from({ length: testCount }).map(
        (_, idx) =>
          new Promise<void>((resolve) => {
            const element = document.createElement("span");
            element.innerHTML = idx.toString();

            setTimeout(() => {
              querySelectors.target($document).appendChild(element);
              resolve();
            }, 1);
          })
      );

      cy.wrap(Promise.all(promises)).then(() => {
        cy.get("@handleItems").should("have.callCount", 10);
      });
    });
  });

  it("should debounce callback invocations according to batchDebounceMs", () => {
    cy.visitMock();

    cy.document().then(($document) => {
      const callTimes: number[] = [];
      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          callTimes.push(Date.now());
        })
        .as("handleItems");

      const debounceMs = 50;
      const ingest = new Ingest($document, handleItems, {
        batchDebounceMs: debounceMs,
        batchSize: 100, // high batch size to avoid size-based flushing
        ignoreElements: new Set<keyof HTMLElementTagNameMap>(["script"]),
      });
      ingest.start();

      const startTime = Date.now();

      // add elements at different intervals to test debouncing
      const addElement = (delay: number, content: string) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            const element = document.createElement("span");
            element.innerHTML = content;
            querySelectors.target($document).appendChild(element);
            resolve();
          }, delay);
        });
      };

      /**
       * Element schedule:
       *   - First at 0ms
       *   - Second at 10ms (should extend debounce)
       *   - Third at 30ms (should extend debounce)
       *   - Fourth at 100ms (should trigger new batch after first completes)
       */
      const elementPromises = [
        addElement(0, "first"),
        addElement(10, "second"),
        addElement(30, "third"),
        addElement(100, "fourth"),
      ];

      cy.wrap(Promise.all(elementPromises)).then(() => {
        // wait enough time for all debounced calls to complete
        cy.wait(200).then(() => {
          cy.get("@handleItems")
            .should("have.been.calledTwice")
            .then(() => {
              // first call should happen around 30ms + 50ms = ~80ms after start
              const firstCallTime = callTimes[0] - startTime;
              expect(firstCallTime).to.be.within(70, 100);

              // second call should happen around 100ms + 50ms = ~150ms after start
              const secondCallTime = callTimes[1] - startTime;
              expect(secondCallTime).to.be.within(140, 170);

              // calls should be at least debounceMs apart
              const timeBetweenCalls = callTimes[1] - callTimes[0];
              expect(timeBetweenCalls).to.be.at.least(debounceMs - 5); // slight tolerance
            });
        });
      });
    });
  });

  it("should immediately flush when batch size is exceeded during debounce", () => {
    cy.visitMock();

    cy.document().then(($document) => {
      const callTimes: number[] = [];
      const itemCounts: number[] = [];

      const handleItems = cy
        .spy((items: HTMLElement[]) => {
          callTimes.push(Date.now());
          itemCounts.push(items.length);
        })
        .as("handleItems");

      const ingest = new Ingest($document, handleItems, {
        batchDebounceMs: 100, // long debounce time
        batchSize: 3, // small batch size
        ignoreElements: new Set<keyof HTMLElementTagNameMap>(["script"]),
      });
      ingest.start();

      const startTime = Date.now();

      // should trigger flush at element 3
      const promises = Array.from({ length: 5 }).map(
        (_, idx) =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              const element = document.createElement("span");
              element.innerHTML = `element-${idx}`;
              querySelectors.target($document).appendChild(element);
              resolve();
            }, idx * 2); // add every 2ms
          })
      );

      cy.wrap(Promise.all(promises)).then(() => {
        cy.wait(150).then(() => {
          cy.get("@handleItems").should("have.callCount", 2);

          cy.then(() => {
            // first call should happen immediately when batch size reached (~6ms)
            const firstCallTime = callTimes[0] - startTime;
            expect(firstCallTime).to.be.within(0, 20);

            // first batch should have exactly 3 items
            expect(itemCounts[0]).to.equal(3);

            // second call should happen after debounce for remaining items (~110ms)
            const secondCallTime = callTimes[1] - startTime;
            expect(secondCallTime).to.be.within(90, 130);

            // second batch should have the remaining 2 items
            expect(itemCounts[1]).to.equal(2);
          });
        });
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

      const ingest = new Ingest($document, handleItems, {
        ignoreElements: new Set<keyof HTMLElementTagNameMap>(["script"]),
      });
      ingest.start();

      cy.get("@handleItems").should("not.have.been.called");
      cy.wrap(found).should("have.length", 0);
    });
  });

  it("should not push mutations when the observer is off", () => {
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      ingest.stopObserver();
      querySelectors.target($document).textContent = "sit";

      cy.get("@handleItems").should("have.been.calledOnce");
      cy.wrap(found).should("have.length", 1);
    });
  });

  it("should continue pushing mutations when the observer is turned off then back on", () => {
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

      const ingest = new Ingest($document, handleItems);
      ingest.start();

      cy.get("@handleItems")
        .should("have.been.calledOnce")
        .then(() => {
          ingest.stopObserver();
          querySelectors.target($document).textContent = "sit";

          ingest.startObserver();
          querySelectors.target($document).textContent = "ipsum";

          cy.get("@handleItems").should("have.been.calledTwice");
          cy.wrap(found).should("have.length", 2);
        });
    });
  });
});
