import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MapModule } from '../map/map.module';
import { DriverComponent } from './driver';
import { DriverWebSocketService } from './services/driver-websocket.service';
import { BaseWebSocketService } from '../common/services/base-websocket.service';
import { RideSearchComponent } from './ride-search/ride-search';
import { StoreModule } from '@ngrx/store';
import { driverFeatureKey, reducer as driverReducer } from './store/driver.reducer';
import { DriverService } from './services/driver.service';

@NgModule({
    declarations: [
        DriverComponent,
        RideSearchComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MapModule,
        StoreModule.forFeature(driverFeatureKey, driverReducer)
    ],
    providers: [
        DriverWebSocketService,
        {
            provide: BaseWebSocketService,
            useExisting: DriverWebSocketService,
        },
        DriverService
    ]
})
export class DriverModule { }