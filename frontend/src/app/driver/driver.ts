import { Component, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { BaseWebSocketService } from "../common/services/base-websocket.service";
import { Point } from "../map/model/point";
import { DriverRide } from "./model/driver-ride.model";
import { PointType } from "../map/model/point-type";
import { DriverState, selectCurrentRide } from "./store/driver.reducer";
import { Store } from "@ngrx/store";

@Component({
    selector: 'driver',
    templateUrl: './driver.html',
    styleUrls: ['./driver.scss'],
    standalone: false
})
export class DriverComponent implements OnDestroy {
    public currentRide: DriverRide | null = null;
    public roadMarkers: Point[] = [];

    private readonly subscription = new Subscription();
    
    constructor(
        private readonly authService: AuthService,
        private readonly webSocketService: BaseWebSocketService,
        private readonly store: Store<DriverState>
    ) {
        this.subscription.add(
            this.authService.isAuthenticated$
                .pipe(distinctUntilChanged())
                .subscribe((isAuthenticated) => {
                    if (isAuthenticated) {
                        const token = this.authService.getToken();
                        if (token) {
                            this.webSocketService.connect(token);
                        }
                        return;
                    }

                    this.webSocketService.disconnect();
                })
        );
        this.subscription.add(this.store.select(selectCurrentRide).subscribe((currentRide) => {
            // this.currentRide = currentRide;
            this.currentRide = {
                passengerName: 'John Doe',
                distance: 5.2,
                price: 12.5,
                pickupLocation: { lat: 40.7128, lng: -74.0060, pointType: PointType.PICKUP_POINT } as Point,
                dropoffLocation: { lat: 40.730610, lng: -73.935242, pointType: PointType.DROPOFF_POINT } as Point,
                rideId: 'sample-ride-id'
            } as DriverRide;
            this.roadMarkers = [
                this.currentRide.pickupLocation,
                this.currentRide.dropoffLocation
            ];
        }));
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.webSocketService.disconnect();
    }
}
