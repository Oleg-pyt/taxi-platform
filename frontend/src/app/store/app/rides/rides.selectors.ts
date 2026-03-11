import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppFeatureState } from '../app.state';
import { RidesState } from './rides.state';
import { ridesEntitySelectors } from './rides.reducer';

export const selectAppState = createFeatureSelector<AppFeatureState>('app');

export const selectRidesState = createSelector(
  selectAppState,
  (state) => state.rides
);

export const selectAllRides = createSelector(
  selectRidesState,
  (state: RidesState) => ridesEntitySelectors.selectAll(state)
);

export const selectRideEntities = createSelector(
  selectRidesState,
  (state: RidesState) => ridesEntitySelectors.selectEntities(state)
);

export const selectRideById = (rideId: string) =>
  createSelector(selectRideEntities, (entities) => entities[rideId] ?? null);

export const selectRidesLoading = createSelector(
  selectRidesState,
  (state) => state.loading
);

export const selectRidesError = createSelector(
  selectRidesState,
  (state) => state.error
);
