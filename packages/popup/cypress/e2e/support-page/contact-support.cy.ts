import english from "../../../src/lib/language/english";

import { interceptContactSupport } from "../../support/interceptors/contact";
import { selectors as s } from "../../support/selectors";

describe("contact support", () => {
  it("should render", () => {
    cy.visitWithStorage({
      sync: {
        preferences: {
          activeTab: "support",
        },
      },
    });

    s.support.loggedInContactOptions().should("not.exist");
    s.support.loggedOutContactOptions().should("be.visible");
  });
});
