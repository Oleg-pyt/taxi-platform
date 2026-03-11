import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-new-ride-dialog',
  templateUrl: './new-ride-dialog.html',
  styleUrl: './new-ride-dialog.scss',
  standalone: false,
})
export class NewRideDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<any>();

  ride = { passenger: '', driver: '', from: '', to: '', status: 'New' };

  saveRide() {
    this.save.emit(this.ride);
    this.ride = { passenger: '', driver: '', from: '', to: '', status: 'New' };
    this.visible = false;
    this.visibleChange.emit(false);
  }
}