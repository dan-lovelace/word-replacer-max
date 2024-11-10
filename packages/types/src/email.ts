import { Environment } from "./config";

/**
 * Contact lists as represented in the SendGrid dashboard.
 */
export const contactLists = [
  "WRM_CognitoSignup",
  "WRM_MarketingSignup",
] as const;

export type SendGridContactList = (typeof contactLists)[number];

export type SendGridConfig = {
  listNames: Record<Environment, string>;
};

export type SendGridContactRequest = {
  contacts: {
    email: string;
    first_name?: string;
  }[];
  list_ids: string[];
};

/**
 * A contact list as returned by the SendGrid API.
 */
export type SendGridList = {
  id: string;
  name: string;
  contact_count: number;
};

/**
 * The response of querying SendGrid for contact lists.
 */
export type SendGridListsResponse = {
  result: SendGridList[];
};
