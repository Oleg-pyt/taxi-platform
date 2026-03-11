import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';
import { UserRole } from '../../auth/auth.service';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectIsDriver = createSelector(
  selectAuthUser,
  (user) => !!user && user.roles.includes(UserRole.DRIVER) && !!user.driverApproved
);

export const selectIsAdmin = createSelector(
  selectAuthUser,
  (user) => !!user && user.roles.includes(UserRole.ADMIN)
);
