"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredTokens,
  decodeJwtClaims,
  getStoredAccessToken,
  isClaimsExpired,
  processLoginResponse,
  type JWTClaims,
} from "./authService";

export interface AuthContextType {
  user: JWTClaims | null;
  isAuthenticated: boolean;
  tenantContext: string | null;
  current_balance: number;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<JWTClaims>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<JWTClaims | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedAccessToken = getStoredAccessToken();

    if (!storedAccessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const decodedClaims = decodeJwtClaims(storedAccessToken);

    if (!decodedClaims || isClaimsExpired(decodedClaims)) {
      clearStoredTokens();
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser(decodedClaims);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (accessToken: string, refreshToken: string): Promise<JWTClaims> => {
    const decodedClaims = decodeJwtClaims(accessToken);

    if (!decodedClaims) {
      throw new Error("Received an access token with an invalid or unparseable claims payload.");
    }

    if (isClaimsExpired(decodedClaims)) {
      throw new Error("Received an access token that has already expired.");
    }

    processLoginResponse(accessToken, refreshToken);
    setUser(decodedClaims);
    return decodedClaims;
  }, []);

  const logout = useCallback((): void => {
    clearStoredTokens();
    setUser(null);

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      tenantContext: user?.tenant_org ?? null,
      current_balance: user?.current_balance ?? 0,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be called within an AuthProvider.");
  }

  return context;
}
