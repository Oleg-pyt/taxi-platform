import { createFeature, createReducer, on } from '@ngrx/store';
import { Point } from '../../map/model/point';
import { CarType } from '../model/car-type';
import { OrderActions, OrderStep } from './order.actions';
import { RideStatus, RideUpdate } from '../service/websocket.service';

export const orderFeatureKey = 'order';

export interface ActiveRideState {
  rideId: string | null;
  status: RideStatus;
  etaMinutes: number | null;
  message: string;
  driverName: string;
  driverPhone: string;
  driverLocation: { lat: number; lng: number } | null;
  connectionError: string;
}

export interface OrderState {
  roadMarkers: Point[];
  orderStep: OrderStep;
  selectedCarType: CarType | null;
  activeRide: ActiveRideState;
}

const initialActiveRideState: ActiveRideState = {
  rideId: null,
  status: RideStatus.CREATED,
  etaMinutes: null,
  message: '',
  driverName: '',
  driverPhone: '',
  driverLocation: null,
  connectionError: ''
};

const initialState: OrderState = {
  roadMarkers: [],
  orderStep: 'ride',
  selectedCarType: null,
  activeRide: initialActiveRideState
};

function applyRideUpdate(state: OrderState, update: RideUpdate): OrderState {
  const trackedRideId = state.activeRide.rideId;

  if (!trackedRideId) {
    if (state.orderStep !== 'active-ride') {
      return state;
    }

    return applyRideUpdate({
      ...state,
      activeRide: {
        ...state.activeRide,
        rideId: update.rideId
      }
    }, update);
  }

  if (update.rideId !== trackedRideId) {
    return state;
  }

  const isTerminalStatus = update.status === RideStatus.COMPLETED
    || update.status === RideStatus.CANCELLED
    || update.status === RideStatus.EXPIRED;

  return {
    ...state,
    orderStep: isTerminalStatus ? 'ride' : 'active-ride',
    activeRide: {
      ...state.activeRide,
      status: update.status,
      etaMinutes: update.estimatedArrival ?? state.activeRide.etaMinutes,
      message: update.message ?? '',
      driverName: update.driverName ?? state.activeRide.driverName,
      driverPhone: update.driverPhone ?? state.activeRide.driverPhone,
      driverLocation: update.driverLocation ?? state.activeRide.driverLocation,
      connectionError: '',
      rideId: isTerminalStatus ? null : state.activeRide.rideId
    }
  };
}

export const orderFeature = createFeature({
  name: orderFeatureKey,
  reducer: createReducer(
    initialState,
    on(OrderActions.setRoadMarkers, (state, { roadMarkers }) => ({
      ...state,
      roadMarkers
    })),
    on(OrderActions.upsertRoadMarker, (state, { marker }) => {
      const withoutSameType = state.roadMarkers.filter((item) => item.pointType !== marker.pointType);
      return {
        ...state,
        roadMarkers: [...withoutSameType, marker]
      };
    }),
    on(OrderActions.clearRoadMarkers, (state) => ({
      ...state,
      roadMarkers: []
    })),
    on(OrderActions.setOrderStep, (state, { step }) => ({
      ...state,
      orderStep: step
    })),
    on(OrderActions.selectCarType, (state, { carType }) => ({
      ...state,
      selectedCarType: carType
    })),
    on(OrderActions.startActiveRideTracking, (state) => ({
      ...state,
      orderStep: 'active-ride',
      activeRide: initialActiveRideState
    })),
    on(OrderActions.rideUpdateReceived, (state, { update }) => applyRideUpdate(state, update)),
    on(OrderActions.connectionErrorReceived, (state, { errorMessage }) => ({
      ...state,
      activeRide: {
        ...state.activeRide,
        connectionError: errorMessage
      }
    }))
  )
});

export const {
  name,
  reducer,
  selectOrderState,
  selectRoadMarkers,
  selectOrderStep,
  selectSelectedCarType,
  selectActiveRide
} = orderFeature;
