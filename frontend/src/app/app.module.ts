import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthModule } from './auth/auth.module';
import { MapModule } from './map/map.module';
import { OrderModule } from './order/order.module';
import { AuthInterceptor } from './auth/auth.interceptor';
import { environment } from '../environments/environments';

import { App } from './app.component';
import { routes } from './app.routes';
import { DriverModule } from './driver/driver.module';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: !environment.production,
      traceLimit: 50,
      connectInZone: true,
    }),
    AuthModule,
    MapModule,
    RouterModule.forRoot(routes),
    ButtonModule,
    TableModule,
    DialogModule,
    DynamicDialogModule,
    InputTextModule,
    OrderModule,
    AuthModule,
    DriverModule
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
