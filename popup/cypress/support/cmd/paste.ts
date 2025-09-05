Cypress.Commands.add(
  "paste",
  { prevSubject: true },
  (selector, pastePayload, options = {}) => {
    const pasteEvent = Object.assign(
      new Event("paste", { bubbles: true, cancelable: true }),
      {
        clipboardData: {
          getData: () => pastePayload,
        },
      }
    );

    return cy.wrap(selector).then((element) => {
      return cy.window().then((win) => {
        if (options.holdShift) {
          const shiftDown = new KeyboardEvent("keydown", {
            key: "Shift",
            shiftKey: true,
            bubbles: true,
          });
          win.document.documentElement.dispatchEvent(shiftDown);

          // wait a tick to ensure state is updated
          return cy.wrap(null).then(() => {
            element[0].dispatchEvent(pasteEvent);

            const shiftUp = new KeyboardEvent("keyup", {
              key: "Shift",
              shiftKey: false,
              bubbles: true,
            });
            win.document.documentElement.dispatchEvent(shiftUp);
          });
        } else {
          element[0].dispatchEvent(pasteEvent);
        }
      });
    });
  }
);
