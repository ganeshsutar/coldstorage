import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth";
import { UIProvider } from "@/stores/ui-store";

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}
