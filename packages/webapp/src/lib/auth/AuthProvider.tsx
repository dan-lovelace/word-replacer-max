import { createContext, useContext, useState } from "react";

import { SignInStatusState } from "@worm/types";

type AppUser = {
  email: string;
};

type AuthProviderContextProps = {
  appUser?: AppUser;
  signInStatus: SignInStatusState;
  setAppUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>;
  setSignInStatus: React.Dispatch<React.SetStateAction<SignInStatusState>>;
};

type AuthProviderProps = React.HTMLAttributes<HTMLDivElement>;

const AuthProviderContext = createContext<AuthProviderContextProps>(
  {} as AuthProviderContextProps
);

const useAuthProviderValue = (): AuthProviderContextProps => {
  const [appUser, setAppUser] = useState<AppUser>();
  const [signInStatus, setSignInStatus] =
    useState<SignInStatusState>("unknown");

  return {
    appUser,
    signInStatus,
    setAppUser,
    setSignInStatus,
  };
};

export const useAuthProvider = () => useContext(AuthProviderContext);

export function AuthProvider({ children }: AuthProviderProps) {
  const value = useAuthProviderValue();

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}
