import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserRole } from './auth.service';

/**
 * Guard для захисту маршрутів, які потребують аутентифікації
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Перевіряємо чи токен валідний (включаючи термін дії)
  if (authService.hasValidToken()) {
    return true;
  }

  // Якщо користувач не аутентифікований, перенаправити на сторінку входу
  router.navigate(['/login']);
  return false;
};

/**
 * Guard для захисту публічних маршрутів від аутентифікованих користувачів
 */
export const publicGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Перевіряємо чи токен валідний
  if (!authService.hasValidToken()) {
    return true;
  }

  // Якщо користувач аутентифікований, перенаправити на map
  router.navigate(['/map']);
  return false;
};

/**
 * Guard для водіїв
 */
export const driverGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken() && authService.isDriver()) {
    return true;
  }

  router.navigate(['/map']);
  return false;
};

/**
 * Guard для адміністраторів
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/map']);
  return false;
};
