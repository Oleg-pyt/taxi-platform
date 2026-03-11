import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Ride } from '../../../map/service/ride.service';

export interface RidesState extends EntityState<Ride> {
  loading: boolean;
  error: string | null;
}

export const ridesAdapter = createEntityAdapter<Ride>({
  selectId: (ride) => ride.id,
  sortComparer: false
});

export const initialRidesState: RidesState = ridesAdapter.getInitialState({
  loading: false,
  error: null
});
