import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderComponent } from './order';
import { MapModule } from '../map/map.module';
import { OrderRideComponent } from './order-ride/order-ride';
import { InputAddressComponent } from './order-ride/input-address/input-address';
import { SelectCarComponent } from './select-car/select-car';
import { StoreModule } from '@ngrx/store';
import { orderFeatureKey, reducer as orderReducer } from './store/order.reducer';
import { CarItemComponent } from './select-car/car-item/car-item';
import { ActiveRideComponent } from './active-ride/active-ride';
import { BaseWebSocketService } from '../common/services/base-websocket.service';
import { OrderWebSocketService } from './service/websocket.service';

@NgModule({
    declarations: [
        OrderComponent,
        OrderRideComponent,
        InputAddressComponent,
        SelectCarComponent,
        CarItemComponent,
        ActiveRideComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MapModule,
        StoreModule.forFeature(orderFeatureKey, orderReducer)
    ],
    providers: [
        OrderWebSocketService,
        {
            provide: BaseWebSocketService,
            useExisting: OrderWebSocketService,
        },
    ]
})
export class OrderModule {}
