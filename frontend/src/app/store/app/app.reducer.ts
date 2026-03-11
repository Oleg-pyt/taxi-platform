import { ActionReducerMap } from '@ngrx/store';
import { AppFeatureState } from './app.state';
import { ridesReducer } from './rides/rides.reducer';
import { uiReducer } from './ui/ui.reducer';

export const appReducers: ActionReducerMap<AppFeatureState> = {
  rides: ridesReducer,
  ui: uiReducer
};
