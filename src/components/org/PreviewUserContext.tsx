"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type PreviewRole = "owner" | "admin" | "member";

export interface PreviewUser {
  id: string;
  name: string;
  email: string;
  role: PreviewRole;
  roleLabel: string;
  initials: string;
  avatarBg: string;
  badgeBg: string;
  badgeText: string;
}

export const PREVIEW_USERS: readonly PreviewUser[] = [
  {
    id: "pu-owner",
    name: "Sarah Mitchell",
    email: "sarah.m@nutracorp.test",
    role: "owner",
    roleLabel: "Owner",
    initials: "SM",
    avatarBg: "bg-violet-600",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
  },
  {
    id: "pu-admin",
    name: "James Chen",
    email: "james.c@nutracorp.test",
    role: "admin",
    roleLabel: "Admin",
    initials: "JC",
    avatarBg: "bg-indigo-600",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
  },
  {
    id: "pu-member",
    name: "Priya Patel",
    email: "priya.p@nutracorp.test",
    role: "member",
    roleLabel: "Member",
    initials: "PP",
    avatarBg: "bg-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
] as const;

interface Ctx {
  currentUser: PreviewUser;
  setCurrentUser: (u: PreviewUser) => void;
}

const PreviewUserContext = createContext<Ctx | null>(null);

export function PreviewUserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PreviewUser>(PREVIEW_USERS[0]);
  return (
    <PreviewUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </PreviewUserContext.Provider>
  );
}

export function usePreviewUser(): Ctx {
  const ctx = useContext(PreviewUserContext);
  if (!ctx) throw new Error("usePreviewUser must be used inside PreviewUserProvider");
  return ctx;
}
