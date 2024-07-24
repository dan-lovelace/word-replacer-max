import { TargetProps, VisitMockParams } from "../types";

import { selectors as s } from "../../lib/selectors";

Cypress.Commands.add("visitMock", (params?: VisitMockParams) => {
  cy.visit("./__mocks__/index.html");

  if (!params) {
    return;
  }

  const { bodyContents, targetContents, targetProps } = params;

  if (bodyContents) {
    s.body().then(($element) => {
      const targetElement = $element.get(0);

      targetElement.innerHTML = bodyContents;
    });
  }

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
