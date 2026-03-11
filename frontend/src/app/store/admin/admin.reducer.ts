import { createReducer, on } from '@ngrx/store';
import * as AdminActions from './admin.actions';
import { initialAdminState } from './admin.state';

export const adminReducer = createReducer(
  initialAdminState,
  on(
    AdminActions.loadApplications,
    AdminActions.loadUsers,
    AdminActions.loadStats,
    AdminActions.approveApplication,
    AdminActions.rejectApplication,
    AdminActions.blockUser,
    (state) => ({ ...state, loading: true, error: null })
  ),
  on(AdminActions.loadApplicationsSuccess, (state, { applications }) => ({
    ...state,
    applications,
    loading: false,
    error: null
  })),
  on(AdminActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
    error: null
  })),
  on(AdminActions.loadStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    loading: false,
    error: null
  })),
  on(AdminActions.mutateSuccess, (state) => ({ ...state, loading: false, error: null })),
  on(
    AdminActions.loadApplicationsFailure,
    AdminActions.loadUsersFailure,
    AdminActions.loadStatsFailure,
    AdminActions.mutateFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  )
);
