import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function MemberTierLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN", "MODERATOR", "MEMBER"]}>{children}</RoleGuard>;
}
