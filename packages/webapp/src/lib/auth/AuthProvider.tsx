import { createContext, useContext, useState } from "react";

type AppUser = {
  email: string;
};

type AuthProviderContextProps = {
  appUser?: AppUser;
  setAppUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>;
};

type AuthProviderProps = React.HTMLAttributes<HTMLDivElement>;

const AuthProviderContext = createContext<AuthProviderContextProps>(
  {} as AuthProviderContextProps
);

const useAuthProviderValue = (): AuthProviderContextProps => {
  const [appUser, setAppUser] = useState<AppUser>();

  return {
    appUser,
    setAppUser,
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
