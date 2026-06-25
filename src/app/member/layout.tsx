import type { ReactNode } from "react";
import MemberShell from "@/components/member/MemberShell";

export default function MemberPreviewLayout({ children }: { children: ReactNode }) {
  return <MemberShell>{children}</MemberShell>;
}
