import { API_ROUTES } from "@wordreplacermax/types/src/api";
import { UserTokens } from "@wordreplacermax/types/src/permission";
import { LocalStorage } from "@wordreplacermax/types/src/storage";

const cache: Partial<{ sessionStore: LocalStorage }> = {
  sessionStore: undefined,
};

Cypress.Commands.add("appUserLogin", () => {
  const apiOrigin = Cypress.env("VITE_API_ORIGIN");
  const username = Cypress.env("VITE_TEST_USERNAME");

  cy.wrap(null).then(async () => {
    const updateStorageTokens = (tokens: UserTokens) => {
      cy.getBrowser().then((browser) => {
        const sessionStore: LocalStorage = {
          authAccessToken: tokens.accessToken,
          authIdToken: tokens.idToken,
          authLastAuthUser: username,
        };

        browser.storage?.local?.set(sessionStore).then(() => {
          cache.sessionStore = sessionStore;
        });
      });
    };

    if (cache.sessionStore !== undefined) {
      const cachedTokens: UserTokens = {
        accessToken: String(cache.sessionStore.authAccessToken),
        idToken: String(cache.sessionStore.authIdToken),
      };

      updateStorageTokens(cachedTokens);
    } else {
      const url = `${apiOrigin}${API_ROUTES["POST:authTestTokens"]}`;

      cy.request("POST", url, {
        username,
        password: Cypress.env("VITE_TEST_PASSWORD"),
      }).then(({ body: { data } }) => {
        updateStorageTokens(data);
      });
    }
  });
});
