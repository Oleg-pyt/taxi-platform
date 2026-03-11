import { createAction, props } from '@ngrx/store';
import { Ride } from '../../map/service/ride.service';

export const loadAvailableRides = createAction('[Driver] Load Available Rides');

export const loadAvailableRidesSuccess = createAction(
  '[Driver] Load Available Rides Success',
  props<{ rides: Ride[] }>()
);

export const loadAvailableRidesFailure = createAction(
  '[Driver] Load Available Rides Failure',
  props<{ error: string }>()
);

export const loadCurrentRide = createAction('[Driver] Load Current Ride');

export const loadCurrentRideSuccess = createAction(
  '[Driver] Load Current Ride Success',
  props<{ ride: Ride | null }>()
);

export const loadCurrentRideFailure = createAction(
  '[Driver] Load Current Ride Failure',
  props<{ error: string }>()
);

export const acceptRide = createAction(
  '[Driver] Accept Ride',
  props<{ rideId: string }>()
);

export const acceptRideSuccess = createAction(
  '[Driver] Accept Ride Success',
  props<{ ride: Ride }>()
);

export const acceptRideFailure = createAction(
  '[Driver] Accept Ride Failure',
  props<{ error: string }>()
);
