import { fetchAuthSession } from "aws-amplify/auth";
import { signOut } from "aws-amplify/auth/cognito";

import { JWT_EMAIL_VERIFIED_KEY } from "@worm/shared/src/permission";
import { AppUser } from "@worm/types";

export const getAuthTokens = async (forceRefresh: boolean = false) => {
  const { tokens } = await fetchAuthSession({ forceRefresh });

  return tokens;
};

export const getCurrentUser = async (): Promise<AppUser | undefined> => {
  const tokens = await getAuthTokens();

  const email = tokens?.idToken?.payload?.email?.toString();
  const emailVerified = Boolean(
    tokens?.idToken?.payload?.[JWT_EMAIL_VERIFIED_KEY] === true
  );

  if (!email) {
    return undefined;
  }

  return { email, emailVerified };
};

export const signUserOut = () => {
  return signOut();
};
