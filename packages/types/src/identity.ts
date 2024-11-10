import { TermsAcceptance } from "./permission";

const identificationErrorMessages: Record<IdentificationErrorName, string> = {
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

type IdentificationErrorName = "MissingTokens" | "Standard" | "UserNotLoggedIn";

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
