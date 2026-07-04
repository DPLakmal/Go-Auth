export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  message: string;
  tokens: AuthTokens;
}

export interface CurrentUserResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}
