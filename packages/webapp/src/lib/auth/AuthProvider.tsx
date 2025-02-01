import { createContext, useContext, useState } from "react";

import { SignInStatus } from "@worm/types/src/identity";

type AppUser = {
  email: string;
};

type AuthProviderContextProps = {
  appUser?: AppUser;
  signInStatus: SignInStatus;
  setAppUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>;
  setSignInStatus: React.Dispatch<React.SetStateAction<SignInStatus>>;
};

type AuthProviderProps = React.HTMLAttributes<HTMLDivElement>;

const AuthProviderContext = createContext<AuthProviderContextProps>(
  {} as AuthProviderContextProps
);

const useAuthProviderValue = (): AuthProviderContextProps => {
  const [appUser, setAppUser] = useState<AppUser>();
  const [signInStatus, setSignInStatus] = useState<SignInStatus>("unknown");

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
