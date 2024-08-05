/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

import { DevBrowser } from "../../dev-webextension-polyfill";

import { VisitWithStorageParams } from "./types";

declare global {
  namespace Cypress {
    interface Chainable {
      getBrowser(): Chainable<DevBrowser>;
      visitWithStorage(params?: VisitWithStorageParams): Chainable<void>;
    }

    interface Window {
      CYPRESS_BROWSER: DevBrowser;
    }
  }
}

import "./cmd";
