import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function ModeratorTierLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]}>{children}</RoleGuard>;
}
