import { createAction, props } from '@ngrx/store';
import { DriverApplication, RideStats } from './admin.state';
import { User } from '../../auth/auth.service';

export const loadApplications = createAction('[Admin] Load Applications');
export const loadApplicationsSuccess = createAction(
  '[Admin] Load Applications Success',
  props<{ applications: DriverApplication[] }>()
);
export const loadApplicationsFailure = createAction('[Admin] Load Applications Failure', props<{ error: string }>());

export const loadUsers = createAction('[Admin] Load Users');
export const loadUsersSuccess = createAction('[Admin] Load Users Success', props<{ users: User[] }>());
export const loadUsersFailure = createAction('[Admin] Load Users Failure', props<{ error: string }>());

export const loadStats = createAction('[Admin] Load Stats');
export const loadStatsSuccess = createAction('[Admin] Load Stats Success', props<{ stats: RideStats }>());
export const loadStatsFailure = createAction('[Admin] Load Stats Failure', props<{ error: string }>());

export const approveApplication = createAction('[Admin] Approve Application', props<{ applicationId: string }>());
export const rejectApplication = createAction('[Admin] Reject Application', props<{ applicationId: string }>());
export const blockUser = createAction('[Admin] Block User', props<{ userId: string }>());

export const mutateSuccess = createAction('[Admin] Mutate Success');
export const mutateFailure = createAction('[Admin] Mutate Failure', props<{ error: string }>());
