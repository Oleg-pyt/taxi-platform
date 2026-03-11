import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RideService } from '../../../map/service/ride.service';
import * as RidesActions from './rides.actions';

@Injectable()
export class RidesEffects {
  private readonly actions$ = inject(Actions);
  private readonly rideService = inject(RideService);

  loadRides$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RidesActions.loadRides),
      switchMap(() =>
        this.rideService.getRideHistory().pipe(
          map((rides) => RidesActions.loadRidesSuccess({ rides })),
          catchError((error: Error) => of(RidesActions.loadRidesFailure({ error: error.message })))
        )
      )
    )
  );

  createRide$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RidesActions.createRide),
      switchMap(({ payload }) =>
        this.rideService.createRide(payload).pipe(
          map((ride) => RidesActions.createRideSuccess({ ride })),
          catchError((error: Error) => of(RidesActions.createRideFailure({ error: error.message })))
        )
      )
    )
  );

}
