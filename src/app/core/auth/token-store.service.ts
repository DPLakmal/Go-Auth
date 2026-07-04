import { Injectable, computed, signal } from '@angular/core';
import { AuthTokens } from './auth.models';

const ACCESS_TOKEN_KEY = 'go_auth.access_token';
const REFRESH_TOKEN_KEY = 'go_auth.refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenStoreService {
  private readonly accessTokenSignal = signal<string | null>(this.read(ACCESS_TOKEN_KEY));
  private readonly refreshTokenSignal = signal<string | null>(this.read(REFRESH_TOKEN_KEY));

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();
  readonly hasSession = computed(() => Boolean(this.accessTokenSignal() && this.refreshTokenSignal()));

  setTokens(tokens: AuthTokens): void {
    this.write(ACCESS_TOKEN_KEY, tokens.access_token);
    this.write(REFRESH_TOKEN_KEY, tokens.refresh_token);
    this.accessTokenSignal.set(tokens.access_token);
    this.refreshTokenSignal.set(tokens.refresh_token);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
