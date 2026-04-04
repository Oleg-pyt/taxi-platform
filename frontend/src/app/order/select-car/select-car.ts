import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CAR_OPTIONS, CarOption, CarType } from '../model/car-type';
import { OrderActions } from '../store/order.actions';
import { selectSelectedCarType } from '../store/order.reducer';
import { OrderService } from '../service/order.service';


export type PaymentMethod = 'card' | 'cash';

@Component({
    selector: 'select-car',
    templateUrl: './select-car.html',
    styleUrls: ['./select-car..scss'],
    standalone: false
})
export class SelectCarComponent implements OnDestroy {
    public readonly carOptions: CarOption[] = CAR_OPTIONS;
    public selectedType: CarType | null = null;
    public selectedPayment: PaymentMethod | null = null;

    private subscription: Subscription;

    constructor(
        private store: Store,
        private orderService: OrderService

    ) {
        this.subscription = this.store
            .select(selectSelectedCarType)
            .subscribe((type) => (this.selectedType = type));
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public selectCar(type: CarType): void {
        this.store.dispatch(OrderActions.selectCarType({ carType: type }));
    }

    public selectPayment(method: PaymentMethod): void {
        this.selectedPayment = method;
    }

    public confirmSelection(): void {
        this.orderService.orderRide();

    }

    public onBack(): void {
        this.store.dispatch(OrderActions.setOrderStep({ step: 'ride' }));
    }
}
