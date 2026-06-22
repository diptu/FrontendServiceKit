import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminTierLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]} requireMfa>
      {children}
    </RoleGuard>
  );
}
