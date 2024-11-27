import { ENDPOINTS } from "../endpoints";

export function interceptSuggest() {
  cy.getBrowser().then(async (browser) => {
    const authAccessToken = (await browser.storage.local?.get())
      ?.authAccessToken;

    cy.intercept(ENDPOINTS.SUGGEST, (request) => {
      request.headers.Authorization = `Bearer ${authAccessToken}`;
    }).as("suggestResult");
  });
}
