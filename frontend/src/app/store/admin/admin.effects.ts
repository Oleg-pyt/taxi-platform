import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdminService } from '@benatti/api';
import * as AdminActions from './admin.actions';
import { UserRole } from '../../auth/auth.service';

@Injectable()
export class AdminEffects {
  private readonly actions$ = inject(Actions);
  private readonly adminService = inject(AdminService);

  loadApplications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadApplications),
      switchMap(() =>
        this.adminService.getDriverApplications().pipe(
          map((applications) =>
            AdminActions.loadApplicationsSuccess({
              applications: applications as any
            })
          ),
          catchError((error: Error) => of(AdminActions.loadApplicationsFailure({ error: error.message })))
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      switchMap(() =>
        this.adminService.getAdminUsers().pipe(
          map((users) =>
            AdminActions.loadUsersSuccess({
              users: users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone ?? undefined,
                roles: user.roles as UserRole[],
                isDriver: user.isDriver,
                driverApproved: user.driverApproved ?? undefined
              }))
            })
          ),
          catchError((error: Error) => of(AdminActions.loadUsersFailure({ error: error.message })))
        )
      )
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadStats),
      switchMap(() =>
        this.adminService.getAdminStats().pipe(
          map((stats) => AdminActions.loadStatsSuccess({ stats })),
          catchError((error: Error) => of(AdminActions.loadStatsFailure({ error: error.message })))
        )
      )
    )
  );

  approveApplication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.approveApplication),
      switchMap(({ applicationId }) =>
        this.adminService.approveDriverApplication(applicationId).pipe(
          switchMap(() => [AdminActions.mutateSuccess(), AdminActions.loadApplications()]),
          catchError((error: Error) => of(AdminActions.mutateFailure({ error: error.message })))
        )
      )
    )
  );

  rejectApplication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.rejectApplication),
      switchMap(({ applicationId }) =>
        this.adminService.rejectDriverApplication(applicationId).pipe(
          switchMap(() => [AdminActions.mutateSuccess(), AdminActions.loadApplications()]),
          catchError((error: Error) => of(AdminActions.mutateFailure({ error: error.message })))
        )
      )
    )
  );

  blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.blockUser),
      switchMap(({ userId }) =>
        this.adminService.blockUser(userId).pipe(
          switchMap(() => [AdminActions.mutateSuccess(), AdminActions.loadUsers()]),
          catchError((error: Error) => of(AdminActions.mutateFailure({ error: error.message })))
        )
      )
    )
  );

}
