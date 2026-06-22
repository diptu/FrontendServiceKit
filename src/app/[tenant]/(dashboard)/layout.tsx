import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import SecurityGuard from "@/components/auth/SecurityGuard";
import { AuthorizationProvider } from "@/core/auth/AuthorizationContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SecurityGuard>
      <AuthorizationProvider>
        <AppShell>{children}</AppShell>
      </AuthorizationProvider>
    </SecurityGuard>
  );
}
