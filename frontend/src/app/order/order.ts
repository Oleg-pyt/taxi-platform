import { Component, OnDestroy } from "@angular/core";
import { Point } from "../map/model/point";
import { PointType } from "../map/model/point-type";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { BaseWebSocketService } from "../common/services/base-websocket.service";
import { OrderActions, OrderStep } from "./store/order.actions";
import { OrderState, selectOrderStep } from "./store/order.reducer";
import { selectAdditionalMarkers, selectRoadMarkersMap } from "./store/order.selectors";

@Component({
    selector: 'order',
    templateUrl: './order.html',
    styleUrls: ['./order.scss'],
    standalone: false
})
export class OrderComponent implements OnDestroy {
    public selectionMode: PointType | null = null;
    public orderStep: OrderStep = 'ride';

    public roadMarkers: Point[] = [];
    public additionalMarkers: Point[] = [];
    public roadMarkersMap: Map<PointType, Point> = new Map<PointType, Point>();

    private subscription: Subscription = new Subscription();

    constructor(
        private readonly store: Store<OrderState>,
        private readonly authService: AuthService,
        private readonly webSocketService: BaseWebSocketService
    ) {
        this.subscription.add(this.authService.isAuthenticated$
            .pipe(distinctUntilChanged())
            .subscribe((isAuthenticated) => {
                console.log('Auth status changed:', isAuthenticated);
                if (isAuthenticated) {
                    const token = this.authService.getToken();
                        console.log(token);
                    if (token) {
                        this.webSocketService.connect(token);
                    }
                    return;
                }

                this.webSocketService.disconnect();
            }));

        this.subscription.add(this.store.select(selectOrderStep).subscribe(step => {
            console.log('Order step changed:', step);
            this.orderStep = step;
        }));

        this.subscription.add(this.store.select(selectRoadMarkersMap).subscribe(roadMarkersMap => {
            this.roadMarkersMap = roadMarkersMap;
            let roadMarkers: Point[] = [];
            const pickupPoint = roadMarkersMap.get(PointType.PICKUP_POINT) || roadMarkersMap.get(PointType.USER_LOCATION);
            if (pickupPoint) {
                roadMarkers.push(pickupPoint);
            }
            const dropoffPoint = roadMarkersMap.get(PointType.DROPOFF_POINT);
            if (dropoffPoint) {
                roadMarkers.push(dropoffPoint);
            }
            this.roadMarkers = roadMarkers;
        }));

        this.subscription.add(this.store.select(selectAdditionalMarkers).subscribe((markers) => {
            this.additionalMarkers = markers;
        }));
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.webSocketService.disconnect();
    }

    public onMapPickRequested(pointType: PointType): void {
        this.selectionMode = pointType;
    }

    public onMapClick(point: Point): void {
        if (this.selectionMode) {
            this.selectionMode = null;
            this.store.dispatch(OrderActions.upsertRoadMarker({ marker: point }));
        }
    }

    public onAddPoint(point: Point): void {
        this.store.dispatch(OrderActions.upsertRoadMarker({ marker: point }));
    }
}
