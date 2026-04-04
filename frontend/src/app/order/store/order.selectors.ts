import { createSelector } from '@ngrx/store';
import { selectActiveRide, selectRoadMarkers } from './order.reducer';
import { PointType } from '../../map/model/point-type';
import { Point } from '../../map/model/point';

export const selectRoadMarkersMap = createSelector(selectRoadMarkers, (roadMarkers) => {
  return new Map(roadMarkers?.map((marker) => [marker.pointType, marker]) || []);
});

export const selectPickupMarker = createSelector(selectRoadMarkers, (roadMarkers) => {
  return roadMarkers?.find((marker) => marker.pointType === PointType.PICKUP_POINT);
});

export const selectDropoffMarker = createSelector(selectRoadMarkers, (roadMarkers) => {
  return roadMarkers?.find((marker) => marker.pointType === PointType.DROPOFF_POINT);
});

export const selectActiveRideVm = createSelector(selectActiveRide, (activeRide) => {
  return {
    status: activeRide.status,
    etaMinutes: activeRide.etaMinutes,
    driverName: activeRide.driverName,
    driverPhone: activeRide.driverPhone,
    statusMessage: activeRide.message,
    connectionError: activeRide.connectionError
  };
});

export const selectAdditionalMarkers = createSelector(selectActiveRide, (activeRide) => {
  if (!activeRide.driverLocation) {
    return [] as Point[];
  }

  return [{
    lat: activeRide.driverLocation.lat,
    lng: activeRide.driverLocation.lng,
    pointType: PointType.DRIVER_LOCATION
  }];
});
