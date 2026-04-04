import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CarOption, CarType } from "../../model/car-type";

@Component({
    selector: 'car-item',
    templateUrl: './car-item.html',
    styleUrls: ['./car-item.scss'],
    standalone: false
})
export class CarItemComponent {
    @Input() option!: CarOption;
    @Input() selectedType: CarType | null = null;
    @Output() onSelectCar = new EventEmitter<CarType>();
    

    public selectCar(type: CarType): void {
        this.onSelectCar.emit(type);
    }

    // Placeholder for car item details
}
