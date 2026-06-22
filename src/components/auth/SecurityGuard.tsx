"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/AuthContext";

interface SecurityGuardProps {
  children: ReactNode;
}

export default function SecurityGuard({ children }: SecurityGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const requiresMfaChallenge = user !== null && user.role === "ADMIN" && user.is_mfa_verified === false;

  useEffect(() => {
    if (!isLoading && requiresMfaChallenge) {
      router.push("/mfa");
    }
  }, [isLoading, requiresMfaChallenge, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  if (requiresMfaChallenge) {
    return null;
  }

  return <>{children}</>;
}
