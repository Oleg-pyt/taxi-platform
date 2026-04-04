import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PlaceSuggestion } from "../../map/service/mapbox-api.service";
import { Point } from "../../map/model/point";
import { PointType } from "../../map/model/point-type";
import { Store } from "@ngrx/store";
import { OrderActions } from "../store/order.actions";

@Component({
    selector: 'order-ride',
    templateUrl: './order-ride.html',
    styleUrls: ['./order-ride.scss'],
    standalone: false
})
export class OrderRideComponent {
    rideForm!: FormGroup;
    public readonly PointType = PointType;

    @Input()
    public isMapPickMode: boolean = false;
    @Input()
    public roadMarkersMap: Map<PointType, Point> = new Map<PointType, Point>();

    @Output() onAddPoint = new EventEmitter<Point>();
    @Output() mapPickRequested = new EventEmitter<PointType>();

    constructor(
        private formBuilder: FormBuilder,
        private readonly store: Store
    ) {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.rideForm = this.formBuilder.group({
            pickupAddress: ['', Validators.required],
            dropoffAddress: ['', Validators.required]
        });
    }

    public addressSelected(address: PlaceSuggestion, pointType: PointType): void {
        if (address) {
            const point = { lat: address.lat, lng: address.lng, pointType} as Point;
            console.log('Emitting point:', point);
            this.onAddPoint.emit(point);
        }
    }

    public onMapPickRequested(pointType: PointType): void {
        console.log('Map pick requested for point type:', pointType);
        this.mapPickRequested.emit(pointType);
    }

    public submitOrder(): void {
        this.store.dispatch(OrderActions.setOrderStep({ step: 'select-car' }));
    }

    public canSubmitOrder(): boolean {
        return true;
    }

    public getValue(pointType: PointType): Point | undefined {
        let point = this.roadMarkersMap.get(pointType);
        if (!point && pointType === PointType.PICKUP_POINT) {
            point = this.roadMarkersMap.get(PointType.USER_LOCATION);
        }
        return point;
    }
}
