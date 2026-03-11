import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: false,
})
export class Dashboard {
  showDialog = false;

  rides = [
    { passenger: 'Oleg', driver: 'Ivan', from: 'Center', to: 'Airport', status: 'In Progress' },
    { passenger: 'Anna', driver: 'Serhiy', from: 'Station', to: 'Mall', status: 'Completed' },
  ];

  addRide(ride: any) {
    this.rides = [...this.rides, ride];
  }
}
