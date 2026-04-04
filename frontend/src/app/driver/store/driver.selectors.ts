import { createSelector } from '@ngrx/store';
import { selectCurrentRide, selectIsSearching } from './driver.reducer';

export const selectDriverRideVm = createSelector(
  selectCurrentRide,
  selectIsSearching,
  (currentRide, isSearching) => ({
    currentRide,
    isSearching
  })
);
