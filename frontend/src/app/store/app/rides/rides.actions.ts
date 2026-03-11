import { createAction, props } from '@ngrx/store';
import { CreateRideRequest, Ride } from '../../../map/service/ride.service';

export const loadRides = createAction('[Rides] Load Rides');

export const loadRidesSuccess = createAction(
  '[Rides] Load Rides Success',
  props<{ rides: Ride[] }>()
);

export const loadRidesFailure = createAction(
  '[Rides] Load Rides Failure',
  props<{ error: string }>()
);

export const createRide = createAction(
  '[Rides] Create Ride',
  props<{ payload: CreateRideRequest }>()
);

export const createRideSuccess = createAction(
  '[Rides] Create Ride Success',
  props<{ ride: Ride }>()
);

export const createRideFailure = createAction(
  '[Rides] Create Ride Failure',
  props<{ error: string }>()
);
