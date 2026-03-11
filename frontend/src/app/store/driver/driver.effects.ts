import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RideService } from '../../map/service/ride.service';
import * as DriverActions from './driver.actions';

@Injectable()
export class DriverEffects {
  private readonly actions$ = inject(Actions);
  private readonly rideService = inject(RideService);

  loadAvailableRides$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriverActions.loadAvailableRides),
      switchMap(() =>
        this.rideService.getAvailableRidesForDriver().pipe(
          map((rides) => DriverActions.loadAvailableRidesSuccess({ rides })),
          catchError((error: Error) => of(DriverActions.loadAvailableRidesFailure({ error: error.message })))
        )
      )
    )
  );

  loadCurrentRide$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriverActions.loadCurrentRide),
      switchMap(() =>
        this.rideService.getActiveRide().pipe(
          map((ride) => DriverActions.loadCurrentRideSuccess({ ride })),
          catchError((error: Error) => of(DriverActions.loadCurrentRideFailure({ error: error.message })))
        )
      )
    )
  );

  acceptRide$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DriverActions.acceptRide),
      switchMap(({ rideId }) =>
        this.rideService.acceptRide(rideId).pipe(
          map((ride) => DriverActions.acceptRideSuccess({ ride })),
          catchError((error: Error) => of(DriverActions.acceptRideFailure({ error: error.message })))
        )
      )
    )
  );

}
