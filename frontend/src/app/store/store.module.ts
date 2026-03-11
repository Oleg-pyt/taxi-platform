import { NgModule, isDevMode } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { authReducer } from './auth/auth.reducer';
import { appReducers } from './app/app.reducer';
import { driverReducer } from './driver/driver.reducer';
import { adminReducer } from './admin/admin.reducer';
import { AuthEffects } from './auth/auth.effects';
import { RidesEffects } from './app/rides/rides.effects';
import { DriverEffects } from './driver/driver.effects';
import { AdminEffects } from './admin/admin.effects';

@NgModule({
  imports: [
    StoreModule.forRoot({ auth: authReducer, driver: driverReducer, admin: adminReducer }),
    StoreModule.forFeature('app', appReducers),
    EffectsModule.forRoot([AuthEffects, RidesEffects, DriverEffects, AdminEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode()
    })
  ]
})
export class AppStoreModule {}
