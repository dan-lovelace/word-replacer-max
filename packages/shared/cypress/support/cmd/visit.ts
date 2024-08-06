import { TargetProps, VisitMockParams } from "../types";

import { selectors as s } from "../selectors";

function changeHTML(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>,
  html: string
) {
  selector().then(($element) => {
    const targetElement = $element.get(0);

    targetElement.innerHTML = html;
  });
}

Cypress.Commands.add("visitMock", (params?: VisitMockParams) => {
  const html = params?.html ?? "simple.html";

  cy.visit(`./__mocks__/${html}`);

  if (!params) {
    return;
  }

  const {
    bodyContents,
    scriptContents,
    targetContents,
    targetProps,
    titleContents,
  } = params;

  if (bodyContents) {
    changeHTML(s.body, bodyContents);
  }

  if (scriptContents) {
    changeHTML(s.script, scriptContents);
  }

  if (targetContents) {
    changeHTML(s.target, targetContents);
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

  if (titleContents) {
    changeHTML(s.title, titleContents);
  }
});
