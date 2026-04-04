import { Routes } from '@angular/router';
import { authEntryGuard, authGuard } from './auth/auth.guard';
import { OrderComponent } from './order/order';
import { DriverComponent } from './driver/driver';

export const routes: Routes = [
  {
    path: 'auth',
    canMatch: [authEntryGuard],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'order',
    canActivate: [authGuard],
    // providers: [
    //   OrderService,
    //   ...provideFeatureWebSocketService(OrderWebSocketService)
    // ],
    // loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
    component: OrderComponent
  },
  {
    path: 'driver',
    // providers: [
    //   ...provideFeatureWebSocketService(DriverWebSocketService)
    // ],
    // loadChildren: () => import('./driver/driver.module').then(m => m.DriverModule),
    component: DriverComponent,
    canActivate: [authGuard] // todo: separate guard for drivers
  },
  // {
  //   path: 'dashboard',
  //   component: Dashboard,
  //   canActivate: [newAuthGuard]
  // },
  // {
  //   path: 'driver-application',
  //   component: DriverApplicationComponent,
  //   canActivate: [newAuthGuard]
  // },
  // {
  //   path: 'driver-panel',
  //   component: DriverPanelComponent,
  //   canActivate: [driverGuard]
  // },
  // {
  //   path: 'driver/available-rides',
  //   component: DriverAvailableRidesComponent,
  //   canActivate: [driverGuard]
  // },
  // {
  //   path: 'driver/active-ride',
  //   component: DriverActiveRideComponent,
  //   canActivate: [driverGuard]
  // },
  // {
  //   path: 'driver/rating/:rideId',
  //   component: RideCompletionComponent,
  //   canActivate: [driverGuard]
  // },
  // {
  //   path: 'admin-panel',
  //   component: AdminPanelComponent,
  //   canActivate: [adminGuard]
  // },
  {
    path: '',
    redirectTo: '/order',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/order'
  }
];
