import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { MapComponent } from './map/map';
import { Dashboard } from './dashboard/dashboard';
import { DriverApplicationComponent } from './driver-application/driver-application';
import { DriverPanelComponent } from './driver-panel/driver-panel';
import { AdminPanelComponent } from './admin-panel/admin-panel';
import { DriverAvailableRidesComponent } from './driver/driver-available-rides/driver-available-rides.component';
import { DriverActiveRideComponent } from './driver/driver-active-ride/driver-active-ride.component';
import { RideCompletionComponent } from './driver/ride-completion/ride-completion.component';
import { authGuard, publicGuard, driverGuard, adminGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'driver-application',
    component: DriverApplicationComponent,
    canActivate: [authGuard]
  },
  {
    path: 'driver-panel',
    component: DriverPanelComponent,
    canActivate: [driverGuard]
  },
  {
    path: 'driver/available-rides',
    component: DriverAvailableRidesComponent,
    canActivate: [driverGuard]
  },
  {
    path: 'driver/active-ride',
    component: DriverActiveRideComponent,
    canActivate: [driverGuard]
  },
  {
    path: 'driver/rating/:rideId',
    component: RideCompletionComponent,
    canActivate: [driverGuard]
  },
  {
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [adminGuard]
  },
  {
    path: '',
    redirectTo: '/map',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/map'
  }
];
