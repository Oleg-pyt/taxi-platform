import { createReducer, on } from '@ngrx/store';
import * as DriverActions from './driver.actions';
import { initialDriverState } from './driver.state';

export const driverReducer = createReducer(
  initialDriverState,
  on(DriverActions.loadAvailableRides, DriverActions.loadCurrentRide, DriverActions.acceptRide, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(DriverActions.loadAvailableRidesSuccess, (state, { rides }) => ({
    ...state,
    availableRides: rides,
    loading: false,
    error: null
  })),
  on(DriverActions.loadCurrentRideSuccess, (state, { ride }) => ({
    ...state,
    currentRide: ride,
    loading: false,
    error: null
  })),
  on(DriverActions.acceptRideSuccess, (state, { ride }) => ({
    ...state,
    currentRide: ride,
    availableRides: state.availableRides.filter((item) => item.id !== ride.id),
    loading: false,
    error: null
  })),
  on(
    DriverActions.loadAvailableRidesFailure,
    DriverActions.loadCurrentRideFailure,
    DriverActions.acceptRideFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  )
);
