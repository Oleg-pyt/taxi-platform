import { AuthState } from './auth/auth.state';
import { AppFeatureState } from './app/app.state';
import { DriverState } from './driver/driver.state';
import { AdminState } from './admin/admin.state';

export interface RootState {
  auth: AuthState;
  app: AppFeatureState;
  driver: DriverState;
  admin: AdminState;
}
