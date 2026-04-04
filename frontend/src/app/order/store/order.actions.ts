import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Point } from '../../map/model/point';
import { CarType } from '../model/car-type';
import { RideUpdate } from '../service/websocket.service';

export type OrderStep = 'ride' | 'select-car' | 'active-ride';

export const OrderActions = createActionGroup({
  source: 'Order',
  events: {
    'Set Road Markers': props<{ roadMarkers: Point[] }>(),
    'Upsert Road Marker': props<{ marker: Point }>(),
    'Clear Road Markers': emptyProps(),
    'Set Order Step': props<{ step: OrderStep }>(),
    'Select Car Type': props<{ carType: CarType }>(),
    'Start Active Ride Tracking': emptyProps(),
    'Ride Update Received': props<{ update: RideUpdate }>(),
    'Connection Error Received': props<{ errorMessage: string }>()
  }
});
