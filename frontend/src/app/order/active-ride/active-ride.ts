import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { OrderState } from '../store/order.reducer';
import { selectActiveRideVm } from '../store/order.selectors';
import { RideStatus } from '../service/websocket.service';

@Component({
    selector: 'active-ride',
    templateUrl: './active-ride.html',
    styleUrls: ['./active-ride.scss'],
    standalone: false
})
export class ActiveRideComponent implements OnDestroy {
    public status: RideStatus = RideStatus.CREATED;
    public etaMinutes: number | null = null;
    public driverName = '';
    public driverPhone = '';
    public statusMessage = '';
    public connectionError = '';

    public readonly RideStatus = RideStatus;
    private readonly subscription = new Subscription();

    constructor(private readonly store: Store<OrderState>) {
        this.subscription.add(this.store.select(selectActiveRideVm).subscribe((vm) => {
            this.status = vm.status;
            this.etaMinutes = vm.etaMinutes;
            this.driverName = vm.driverName;
            this.driverPhone = vm.driverPhone;
            this.statusMessage = vm.statusMessage;
            this.connectionError = vm.connectionError;
        }));
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public get isSearching(): boolean {
        return this.status === RideStatus.CREATED || this.status === RideStatus.OFFERED;
    }

    public get statusLabel(): string {
        switch (this.status) {
            case RideStatus.ACCEPTED:
                return 'Driver accepted';
            case RideStatus.IN_PROGRESS:
                return 'In progress';
            case RideStatus.COMPLETED:
                return 'Completed';
            case RideStatus.CANCELLED:
                return 'Cancelled';
            case RideStatus.EXPIRED:
                return 'Expired';
            default:
                return 'Searching';
        }
    }
}
