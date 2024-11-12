/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import "./cmd";

import { TestBrowser } from "@worm/testing";
import { Storage } from "@worm/types/src/storage";

import { VisitWithStorageParams } from "./types";

declare global {
  namespace Cypress {
    interface Chainable {
      appUserLogin(): Chainable<void>;
      getBrowser(): Chainable<TestBrowser<Storage>>;
      visitWithStorage(params?: VisitWithStorageParams): Chainable<void>;
    }

    interface Window {
      TEST_BROWSER: TestBrowser<Storage>;
    }
  }
}
