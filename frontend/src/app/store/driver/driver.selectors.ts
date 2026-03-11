import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DriverState } from './driver.state';

export const selectDriverState = createFeatureSelector<DriverState>('driver');

export const selectDriverAvailableRides = createSelector(
  selectDriverState,
  (state) => state.availableRides
);

export const selectDriverCurrentRide = createSelector(
  selectDriverState,
  (state) => state.currentRide
);

export const selectDriverLoading = createSelector(
  selectDriverState,
  (state) => state.loading
);

export const selectDriverError = createSelector(
  selectDriverState,
  (state) => state.error
);
