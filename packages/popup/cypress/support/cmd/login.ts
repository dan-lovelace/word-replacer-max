import { API_ROUTES } from "@worm/types/src/api";
import { SessionStorage } from "@worm/types/src/storage";

Cypress.Commands.add("appUserLogin", () => {
  cy.wrap(null).then(async () => {
    const apiOrigin = Cypress.env("VITE_API_ORIGIN");
    const url = `${apiOrigin}${API_ROUTES["POST:authTestTokens"]}`;
    const username = Cypress.env("VITE_TEST_USERNAME");

    cy.request("POST", url, {
      username,
      password: Cypress.env("VITE_TEST_PASSWORD"),
    }).then(({ body: { data } }) => {
      cy.getBrowser().then(async (browser) => {
        const sessionStore: SessionStorage = {
          authAccessToken: data.accessToken,
          authIdToken: data.idToken,
          authLastAuthUser: username,
        };

        await browser.storage?.session?.set(sessionStore);

        cy.wrap(data).as("authTokens");
      });
    });
  });
});
