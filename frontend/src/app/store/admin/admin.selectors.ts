import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from './admin.state';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectAdminApplications = createSelector(selectAdminState, (state) => state.applications);
export const selectAdminUsers = createSelector(selectAdminState, (state) => state.users);
export const selectAdminStats = createSelector(selectAdminState, (state) => state.stats);
export const selectAdminLoading = createSelector(selectAdminState, (state) => state.loading);
export const selectAdminError = createSelector(selectAdminState, (state) => state.error);
