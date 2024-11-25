import { TermsAcceptance } from "./permission";

const identificationErrorMessages = {
  MissingTokens: "Update requires tokens",
  Standard: "Unable to identify user",
  UserNotLoggedIn: "User is not logged in",
};

export type AppUser =
  | {
      email: string;
      emailVerified: boolean;
      termsAcceptance?: TermsAcceptance;
    }
  | undefined;

type IdentificationErrorName = keyof typeof identificationErrorMessages;

export type SignInStatusState =
  | "signedIn"
  | "signedOut"
  | "signingIn"
  | "signingOut"
  | "unknown";

export class IdentificationError extends Error {
  constructor(name: IdentificationErrorName = "Standard") {
    super(identificationErrorMessages[name]);

    this.name = name;

    Object.setPrototypeOf(this, IdentificationError.prototype);
  }
}
