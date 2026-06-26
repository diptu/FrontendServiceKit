"use client";

import { BadgeCheck } from "lucide-react";
import { usePreviewUser } from "./PreviewUserContext";

interface OrgWelcomeBannerProps {
  orgDisplayName: string;
}

const ROLE_SUBTEXT: Record<string, string> = {
  owner:  "You have full control over this organization.",
  admin:  "You can manage users, groups, and access policies.",
  member: "Here's a summary of what's in scope for your account.",
};

export default function OrgWelcomeBanner({ orgDisplayName }: OrgWelcomeBannerProps) {
  const { currentUser } = usePreviewUser();
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
        Welcome back, {firstName}
        <BadgeCheck className="h-5 w-5 text-indigo-500" strokeWidth={2} />
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        <span className="font-medium text-slate-700">{orgDisplayName}</span>
        {" — "}
        {ROLE_SUBTEXT[currentUser.role]}
      </p>
    </div>
  );
}
