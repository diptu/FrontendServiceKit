import type { ReactNode } from "react";
import OrgShell from "@/components/org/OrgShell";

export default function OrgLayout({ children }: { children: ReactNode }) {
  return <OrgShell>{children}</OrgShell>;
}
