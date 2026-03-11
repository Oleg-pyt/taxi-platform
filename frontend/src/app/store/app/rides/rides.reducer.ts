import { createReducer, on } from '@ngrx/store';
import * as RidesActions from './rides.actions';
import { initialRidesState, ridesAdapter } from './rides.state';

export const ridesReducer = createReducer(
  initialRidesState,
  on(RidesActions.loadRides, (state) => ({ ...state, loading: true, error: null })),
  on(RidesActions.loadRidesSuccess, (state, { rides }) =>
    ridesAdapter.setAll(rides, { ...state, loading: false, error: null })
  ),
  on(RidesActions.loadRidesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(RidesActions.createRide, (state) => ({ ...state, loading: true, error: null })),
  on(RidesActions.createRideSuccess, (state, { ride }) =>
    ridesAdapter.upsertOne(ride, { ...state, loading: false, error: null })
  ),
  on(RidesActions.createRideFailure, (state, { error }) => ({ ...state, loading: false, error }))
);

export const ridesEntitySelectors = ridesAdapter.getSelectors();
