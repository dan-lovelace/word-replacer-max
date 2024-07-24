/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

import { VisitMockParams } from "./types";

declare global {
  namespace Cypress {
    interface Chainable {
      visitMock(params?: VisitMockParams): Chainable<void>;
    }
  }
}

import "./cmd";
