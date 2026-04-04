import { createFeature, createReducer, on } from '@ngrx/store';
import { DriverActions } from './driver.actions';
import { DriverRide } from '../model/driver-ride.model';

export const driverFeatureKey = 'driver';

export interface DriverState {
  currentRide: DriverRide | null;
  isSearching: boolean;
}

const initialState: DriverState = {
  currentRide: null,
  isSearching: false
};

export const driverFeature = createFeature({
  name: driverFeatureKey,
  reducer: createReducer(
    initialState,
    on(DriverActions.rideRequestReceived, (state, { ride }) => ({
      ...state,
      currentRide: ride,
      isSearching: false
    })),
    on(DriverActions.clearCurrentRide, (state) => ({
      ...state,
      currentRide: null
    })),
    on(DriverActions.setSearching, (state, { isSearching }) => ({
      ...state,
      isSearching
    })),
    on(DriverActions.acceptRide, (state) => ({
      ...state,
      currentRide: null,
      isSearching: true
    })),
    on(DriverActions.rejectRide, (state) => ({
      ...state,
      currentRide: null,
      isSearching: true
    }))
  )
});

export const {
  name,
  reducer,
  selectDriverState,
  selectCurrentRide,
  selectIsSearching
} = driverFeature;
