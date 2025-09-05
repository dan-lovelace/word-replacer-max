import { cloneElement } from "preact";
import { useMemo } from "preact/hooks";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PreactChildren } from "../lib/types";

type QueryClientProps = {
  children: PreactChildren;
};

const queryClient = new QueryClient();

export function QueryProvider({ children }: QueryClientProps) {
  const Component = useMemo(
    () =>
      ({ children }: QueryClientProps) =>
        cloneElement(<QueryClientProvider client={queryClient} />, {
          children,
        }),
    []
  );

  return <Component>{children}</Component>;
}
