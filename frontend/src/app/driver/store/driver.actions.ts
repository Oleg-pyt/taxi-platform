import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DriverRide } from '../model/driver-ride.model';

export const DriverActions = createActionGroup({
  source: 'Driver',
  events: {
    'Ride Request Received': props<{ ride: DriverRide }>(),
    'Clear Current Ride': emptyProps(),
    'Set Searching': props<{ isSearching: boolean }>(),
    'Accept Ride': emptyProps(),
    'Reject Ride': emptyProps()
  }
});
