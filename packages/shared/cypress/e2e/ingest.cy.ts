import { Ingest } from "@worm/shared/src/replace/ingest";

const addElement = (
  documentObject: Document,
  delay: number,
  content: string
) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const element = documentObject.createElement("span");
      element.innerHTML = content;
      querySelectors.target(documentObject).appendChild(element);
      resolve();
    }, delay);
  });
};

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
        batchMaxWaitMs: 500, // high max wait time to avoid time-based flushing
        batchSize: 100, // high batch size to avoid size-based flushing
      });
      ingest.start();

      const startTime = Date.now();
      const elementSchedule = [
        addElement($document, 0, "first"), // begin debounce
        addElement($document, 10, "second"), // extend debouce
        addElement($document, 30, "third"), // extend debouce, trigger after `debounceMs`
        addElement($document, 100, "fourth"), // begin debounce, trigger after `debounceMs`
      ];

      cy.wrap(Promise.all(elementSchedule)).then(() => {
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
        batchMaxWaitMs: 500, // high max wait time
        batchSize: 3, // small batch size
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

  it("should flush batch after maximum wait time regardless of ongoing mutations", () => {
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

      const debounceMs = 30;
      const maxWaitMs = 80;
      const ingest = new Ingest($document, handleItems, {
        batchDebounceMs: debounceMs,
        batchMaxWaitMs: maxWaitMs,
        batchSize: 100, // high batch size to avoid size-based flushing
      });
      ingest.start();

      const startTime = Date.now();
      const elementSchedule = [
        addElement($document, 0, "first"), // begin debounce and maxWait timers
        addElement($document, 15, "second"), // extend debounce
        addElement($document, 30, "third"), // extend debounce
        addElement($document, 45, "fourth"), // extend debounce
        addElement($document, 60, "fifth"), // extend debounce, trigger after `maxWaitMs`
        addElement($document, 120, "sixth"), // begin debounce, trigger after `debounceMs`
      ];

      cy.wrap(Promise.all(elementSchedule)).then(() => {
        // wait enough time for all operations to complete
        cy.wait(300).then(() => {
          cy.get("@handleItems")
            .should("have.been.calledTwice")
            .then(() => {
              // first call should happen at maxWaitMs (~80ms)
              const firstCallTime = callTimes[0] - startTime;
              expect(firstCallTime).to.be.within(70, 100);
              expect(itemCounts[0]).to.equal(5); // first 5 elements

              // second call should happen after debounce for the sixth element
              const secondCallTime = callTimes[1] - startTime;
              expect(secondCallTime).to.be.within(140, 170); // 120ms + 30ms = ~150ms
              expect(itemCounts[1]).to.equal(1); // sixth element

              // verify time between calls was less than max wait
              expect(secondCallTime - firstCallTime).to.be.lessThan(
                maxWaitMs - 5 // small tolerance
              );
            });
        });
      });
    });
  });

  it("should reset max wait timer when batch is flushed due to size limit", () => {
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

      const maxWaitMs = 100;
      const ingest = new Ingest($document, handleItems, {
        batchDebounceMs: 50,
        batchMaxWaitMs: maxWaitMs,
        batchSize: 3, // small batch size to trigger size-based flush
        ignoreElements: new Set<keyof HTMLElementTagNameMap>(["script"]),
      });
      ingest.start();

      const startTime = Date.now();
      const elementSchedule = [
        addElement($document, 0, "first"), // begin debounce and maxWait timers
        addElement($document, 5, "second"), // extend debounce
        addElement($document, 10, "third"), // trigger after `batchSize`, reset maxWait
        addElement($document, 95, "fourth"), // begin debounce and maxWait timers
        addElement($document, 110, "fifth"), // extend debouce, trigger after `batchDebounceMs`
      ];

      cy.wrap(Promise.all(elementSchedule)).then(() => {
        cy.wait(200).then(() => {
          cy.get("@handleItems").should("have.callCount", 2);

          cy.then(() => {
            // first call should happen immediately when batch size reached (~10ms)
            const firstCallTime = callTimes[0] - startTime;
            expect(firstCallTime).to.be.within(5, 20);
            expect(itemCounts[0]).to.equal(3);

            // second call should happen after debounce for remaining elements
            // NOT after maxWait from the original start time (~100ms)
            const secondCallTime = callTimes[1] - startTime;
            expect(secondCallTime).to.be.within(155, 170);
            expect(itemCounts[1]).to.equal(2);

            // flush should have occurred slower than max wait meaning
            // the max wait was not the trigger for it
            const timeBetweenFlushes = secondCallTime - firstCallTime;
            expect(
              maxWaitMs + 5 // small tolerance
            ).to.be.lessThan(timeBetweenFlushes);
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
