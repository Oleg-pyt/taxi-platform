// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { AppStoreModule } from './store/store.module';

// Custom modules
import { AuthModule } from './auth/auth.module';
import { MapModule } from './map/map.module';
import { AuthInterceptor } from './auth/auth.interceptor';

import { App } from './app.component';
import { Dashboard } from './dashboard/dashboard';
import { NewRideDialog } from './new-ride-dialog/new-ride-dialog';
import { MapComponent } from './map/map';
import { UserMenuComponent } from './user-menu/user-menu';
import { DriverApplicationComponent } from './driver-application/driver-application';
import { DriverPanelComponent } from './driver-panel/driver-panel';
import { AdminPanelComponent } from './admin-panel/admin-panel';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { RideHistoryDialogComponent } from './ride-history-dialog/ride-history-dialog.component';
import { DriverAvailableRidesComponent } from './driver/driver-available-rides/driver-available-rides.component';
import { DriverActiveRideComponent } from './driver/driver-active-ride/driver-active-ride.component';
import { RideCompletionComponent } from './driver/ride-completion/ride-completion.component';

// Роути
import { routes } from './app.routes';

@NgModule({
  declarations: [
    App,
    Dashboard,
    NewRideDialog,
    MapComponent,
    UserMenuComponent,
    DriverApplicationComponent,
    DriverPanelComponent,
    AdminPanelComponent,
    ProfileDialogComponent,
    RideHistoryDialogComponent,
    DriverAvailableRidesComponent,
    DriverActiveRideComponent,
    RideCompletionComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AuthModule,
    MapModule,
    RouterModule.forRoot(routes),
    ButtonModule,
    TableModule,
    DialogModule,
    DynamicDialogModule,
    InputTextModule,
    AppStoreModule,
  ],
  providers: [
    DialogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule {}
