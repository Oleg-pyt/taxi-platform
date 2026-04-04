import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

type GuardResult = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

function redirectToLogin(router: Router): UrlTree {
  return router.parseUrl('/auth/login');
}

function redirectToOrder(router: Router): UrlTree {
  return router.parseUrl('/order');
}

function requireAuthenticatedUser(): GuardResult {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    authService.clearSession();
    return redirectToLogin(router);
  }

  return authService.ensureSessionLoaded().pipe(
    map((ok) => (ok && authService.hasValidToken() ? true : redirectToLogin(router)))
  );
}

function allowGuestsOnly(): GuardResult {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    authService.clearSession();
    return true;
  }

  return authService.ensureSessionLoaded().pipe(
    map((ok) => (ok && authService.hasValidToken() ? redirectToOrder(router) : true))
  );
}

export const authGuard: CanActivateFn = () => requireAuthenticatedUser();

export const authEntryGuard: CanMatchFn = () => allowGuestsOnly();

export const publicGuard: CanActivateFn = () => allowGuestsOnly();
