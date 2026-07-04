import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  AuthTokens,
  AuthUser,
  CurrentUserResponse,
  LoginPayload,
  RefreshResponse,
  RegisterPayload
} from './auth.models';
import { TokenStoreService } from './token-store.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStoreService);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly userSignal = signal<AuthUser | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenStore.hasSession());

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((response) => this.acceptSession(response.user, response.tokens))
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap((response) => this.acceptSession(response.user, response.tokens))
    );
  }

  refresh(): Observable<RefreshResponse> {
    const refreshToken = this.tokenStore.refreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('Missing refresh token'));
    }

    return this.http
      .post<RefreshResponse>(`${this.baseUrl}/auth/refresh`, { refresh_token: refreshToken })
      .pipe(tap((response) => this.tokenStore.setTokens(response.tokens)));
  }

  loadCurrentUser(): Observable<AuthUser | null> {
    if (!this.tokenStore.accessToken()) {
      this.userSignal.set(null);
      return of(null);
    }

    return this.http.get<CurrentUserResponse>(`${this.baseUrl}/users/me`).pipe(
      map((response) => response.user),
      tap((user) => this.userSignal.set(user)),
      catchError(() => {
        this.userSignal.set(null);
        return of(null);
      })
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.tokenStore.refreshToken();

    if (!this.tokenStore.accessToken() || !refreshToken) {
      this.endSession();
      return of(void 0);
    }

    return this.http.post<void>(`${this.baseUrl}/auth/logout`, { refresh_token: refreshToken }).pipe(
      catchError(() => of(void 0)),
      tap(() => this.endSession())
    );
  }

  endSession(): void {
    this.tokenStore.clear();
    this.userSignal.set(null);
  }

  private acceptSession(user: AuthUser, tokens: AuthTokens): void {
    this.tokenStore.setTokens(tokens);
    this.userSignal.set(user);
  }
}
