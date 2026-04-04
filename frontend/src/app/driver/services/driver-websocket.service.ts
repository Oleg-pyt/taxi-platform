import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { BaseWebSocketService } from "../../common/services/base-websocket.service";
import { DriverRideRequest as DriverRideRequestDto } from "../../order/service/websocket.service";
import { DriverRide } from "../model/driver-ride.model";
import { DriverActions } from "../store/driver.actions";
import { DriverState } from "../store/driver.reducer";
import { PointType } from "src/app/map/model/point-type";

@Injectable()
export class DriverWebSocketService extends BaseWebSocketService {
    constructor(private readonly store: Store<DriverState>) {
        super();
    }

    protected onWebSocketOpen(): void {
        console.log('WebSocket connected');
    }

    protected onWebSocketMessage(event: MessageEvent): void {
        console.log('WebSocket message received:', event.data);

        try {
            const message = JSON.parse(event.data);

            if (message.type === 'DRIVER_RIDE_REQUEST' && message.data) {
                const rideDto = message.data as DriverRideRequestDto;
                this.store.dispatch(DriverActions.rideRequestReceived({ ride: this.toDriverRide(rideDto) }));
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error, event.data);
        }
    }

    private toDriverRide(rideDto: DriverRideRequestDto): DriverRide {
        return {
            rideId: rideDto.rideId,
            pickupLocation: {
                lat: rideDto.pickupLocation?.lat ?? 0,
                lng: rideDto.pickupLocation?.lng ?? 0,
                pointType: PointType.PICKUP_POINT
            },
            dropoffLocation: {
                lat: rideDto.dropoffLocation?.lat ?? 0,
                lng: rideDto.dropoffLocation?.lng ?? 0,
                pointType: PointType.DROPOFF_POINT
            },
            passengerName: rideDto.passengerName ?? '',
            price: rideDto.price ?? 0,
            distance: rideDto.distance ?? 0
        };
    }

    protected onWebSocketError(error: Event): void {
        console.error('WebSocket error:', error);
    }

    protected onWebSocketClose(): void {
        console.log('WebSocket disconnected');
    }
}
