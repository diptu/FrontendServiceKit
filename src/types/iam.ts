export type UserStatus = "active" | "suspended" | "mfa_pending";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  client_id: string;
  assigned_roles: string[];
}

export type TokenType = "access" | "refresh";

export interface TokenRecord {
  token_id: string;
  user_id: string;
  type: TokenType;
  issued_at: string;
  expires_at: string;
  risk_score: number;
}

export interface RolePermission {
  role_name: string;
  scopes: string[];
  resource_path: string;
}
