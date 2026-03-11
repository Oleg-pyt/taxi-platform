import { RidesState } from './rides/rides.state';
import { UIState } from './ui/ui.state';

export interface AppFeatureState {
  rides: RidesState;
  ui: UIState;
}
