import { Ride } from '../../map/service/ride.service';

export interface DriverState {
  availableRides: Ride[];
  currentRide: Ride | null;
  loading: boolean;
  error: string | null;
}

export const initialDriverState: DriverState = {
  availableRides: [],
  currentRide: null,
  loading: false,
  error: null
};
