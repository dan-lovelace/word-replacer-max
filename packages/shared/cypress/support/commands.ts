/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import "@testing-library/cypress/add-commands";

import { selectors as s } from "../lib/selectors";

declare global {
  namespace Cypress {
    interface Chainable {
      visitMock(params?: VisitMockParams): Chainable<void>;
    }
  }
}

type TargetProps = Partial<HTMLElement>;

type VisitMockParams = {
  targetContents?: string;
  targetProps?: TargetProps;
};

Cypress.Commands.add("visitMock", (params?: VisitMockParams) => {
  cy.visit("./__mocks__/index.html");

  if (!params) {
    return;
  }

  const { targetContents, targetProps } = params;

  if (targetContents) {
    s.target().then(($element) => {
      const targetElement = $element.get(0);

      targetElement.innerHTML = targetContents;
    });
  }

  if (targetProps) {
    s.target().then(($element) => {
      const targetElement = $element.get(0);

      for (const attribute in targetProps) {
        if (attribute === "className") {
          targetElement.classList.add(String(targetProps["className"]));
        } else {
          targetElement.setAttribute(
            attribute,
            String(targetProps[attribute as keyof TargetProps])
          );
        }
      }
    });
  }
});
