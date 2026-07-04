import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { TokenStoreService } from './token-store.service';

let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStore = inject(TokenStoreService);
  const authService = inject(AuthService);
  const accessToken = tokenStore.accessToken();
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const isRefreshRequest = request.url.endsWith('/auth/refresh');

  const authorizedRequest =
    isApiRequest && accessToken
      ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : request;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isApiRequest || isRefreshRequest || error.status !== 401 || !tokenStore.refreshToken()) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshDone$.pipe(
          filter((token): token is string => Boolean(token)),
          take(1),
          switchMap((token) =>
            next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
          )
        );
      }

      isRefreshing = true;
      refreshDone$.next(null);

      return authService.refresh().pipe(
        switchMap((response) => {
          isRefreshing = false;
          refreshDone$.next(response.tokens.access_token);
          return next(
            request.clone({
              setHeaders: { Authorization: `Bearer ${response.tokens.access_token}` }
            })
          );
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          authService.endSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
