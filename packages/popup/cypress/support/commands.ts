/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

import { TestBrowser } from "@worm/testing";
import { Storage } from "@worm/types";

import { VisitWithStorageParams } from "./types";

declare global {
  namespace Cypress {
    interface Chainable {
      getBrowser(): Chainable<TestBrowser<Storage>>;
      visitWithStorage(params?: VisitWithStorageParams): Chainable<void>;
    }

    interface Window {
      TEST_BROWSER: TestBrowser<Storage>;
    }
  }
}

import "./cmd";
