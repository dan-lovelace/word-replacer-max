import { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type QueryClientProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

export function StoreProvider({ children }: QueryClientProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
