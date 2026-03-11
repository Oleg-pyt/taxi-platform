import { createSelector } from '@ngrx/store';
import { selectAppState } from '../rides/rides.selectors';

export const selectUIState = createSelector(
  selectAppState,
  (state) => state.ui
);

export const selectGlobalLoading = createSelector(
  selectUIState,
  (state) => state.loading
);

export const selectModalState = createSelector(
  selectUIState,
  (state) => state.modal
);

export const selectNotifications = createSelector(
  selectUIState,
  (state) => state.notifications.items
);
