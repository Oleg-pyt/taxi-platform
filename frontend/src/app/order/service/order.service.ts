import { Injectable } from "@angular/core";
import { OrderActions } from "../store/order.actions";
import { Store } from "@ngrx/store";
import { CarType, RideCreateRequest, RidesService, Location } from "@benatti/api";
import { OrderState, selectSelectedCarType } from "../store/order.reducer";
import { selectRoadMarkersMap } from "../store/order.selectors";
import { PointType } from "../../map/model/point-type";

@Injectable()
export class OrderService {
    private roadMarkersMapSignal;
    private selectedCarTypeSignal;

    constructor(
        private rideApiService: RidesService,
        private store: Store<OrderState>
    ) {
        this.roadMarkersMapSignal = this.store.selectSignal(selectRoadMarkersMap);
        this.selectedCarTypeSignal = this.store.selectSignal(selectSelectedCarType);
    }

    public orderRide() {
        this.store.dispatch(OrderActions.startActiveRideTracking());
        const request = this.assembleRideRequest();
        console.log(request);
        if (request) {
            this.rideApiService.createRide(request).subscribe({
                error: (error) => console.error('Failed to create ride', error)
            });
        }
    }

    private assembleRideRequest(): RideCreateRequest | null {
        const roadMarkersMap = this.roadMarkersMapSignal();
        const selectedCarType = this.selectedCarTypeSignal();
        const pickupLocation = roadMarkersMap.get(PointType.PICKUP_POINT) || roadMarkersMap.get(PointType.USER_LOCATION);
        const dropoffLocation = roadMarkersMap.get(PointType.DROPOFF_POINT);
        return pickupLocation && dropoffLocation && selectedCarType ? {
            pickupLocation: { lat: pickupLocation.lat, lng: pickupLocation.lng } as Location,
            dropoffLocation: { lat: dropoffLocation.lat, lng: dropoffLocation.lng } as Location,
            carType: selectedCarType as CarType
        } as RideCreateRequest : null;
    }
}
