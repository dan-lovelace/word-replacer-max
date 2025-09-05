import { merge } from "ts-deepmerge";

import { DeepPartial } from "@wordreplacermax/types";
import { ApiAccountUsage } from "@wordreplacermax/types/src/api";

import { ENDPOINTS } from "../endpoints";

/**
 * Modifies suggestion requests to include the access token from test storage.
 */
export function interceptApiUsage(
  overrides: DeepPartial<ApiAccountUsage> = {}
) {
  cy.intercept(ENDPOINTS.ACCOUNT_USAGE, {
    body: {
      data: merge(
        {
          "POST:suggest": {
            count: 38,
            label: "Replacement suggestions",
            limit: {
              period: {
                interval: "days",
                value: 30,
              },
              threshold: 50,
            },
          },
        },
        overrides
      ),
    },
  }).as("apiUsageResult");
}
