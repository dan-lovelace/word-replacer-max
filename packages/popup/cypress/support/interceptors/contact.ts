import { CyHttpMessages } from "cypress/types/net-stubbing";

import { ENDPOINTS } from "../endpoints";

export function interceptContactSupport(
  responseOverrides?: Partial<CyHttpMessages.IncomingHttpResponse<any>>
) {
  cy.getBrowser().then(async (browser) => {
    const authAccessToken = (await browser.storage.session?.get())
      ?.authAccessToken;

    cy.intercept("POST", ENDPOINTS.CONTACT_SUPPORT, (request) => {
      request.headers.Authorization = `Bearer ${authAccessToken}`;

      if (responseOverrides !== undefined) {
        request.reply(responseOverrides);
      }
    }).as("contactSupportResult");
  });
}
