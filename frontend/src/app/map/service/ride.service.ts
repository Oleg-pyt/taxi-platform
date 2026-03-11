import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RidesService as ApiRidesService, Ride as ApiRide } from '@benatti/api';

export interface CreateRideRequest {
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  price: number;
  distance: number;
  estimatedTime: number;
}

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId?: string | null;
  driverName?: string | null;
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  pickupAddress?: string;
  dropoffAddress?: string;
  status: string;
  price: number;
  distance: number;
  estimatedTime: number;
  durationMinutes?: number;
  createdAt: string;
  acceptedAt?: string | null;
  completedAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  constructor(private apiRidesService: ApiRidesService) {}

  /**
   * Розрахувати вартість поїздки на сервері
   */
  calculatePrice(pickupLocation: { lat: number; lng: number }, dropoffLocation: { lat: number; lng: number }): Observable<{ distance: number; duration: number; price: number; currency: string }> {
    return this.apiRidesService.calculateRidePrice({ pickupLocation, dropoffLocation });
  }

  /**
   * Створити нову поїздку
   */
  createRide(data: CreateRideRequest): Observable<Ride> {
    return this.apiRidesService.createRide(data).pipe(map((ride) => this.toRide(ride)));
  }

  /**
   * Отримати історію поїздок
   */
  getRideHistory(): Observable<Ride[]> {
    return this.apiRidesService.getRideHistory().pipe(
      map((rides) => rides.map((ride) => this.toRide(ride)))
    );
  }

  /**
   * Отримати поточну активну поїздку
   */
  getActiveRide(): Observable<Ride | null> {
    return this.apiRidesService.getActiveRide().pipe(
      map((ride) => (ride ? this.toRide(ride as ApiRide) : null))
    );
  }

  /**
   * Скасувати поїздку
   */
  cancelRide(rideId: string): Observable<void> {
    return this.apiRidesService.cancelRide(rideId).pipe(map(() => void 0));
  }

  /**
   * Водій приймає поїздку
   */
  acceptRide(rideId: string): Observable<Ride> {
    return this.apiRidesService.acceptRide(rideId).pipe(map((ride) => this.toRide(ride)));
  }

  /**
   * Водій завершує поїздку
   */
  completeRide(rideId: string): Observable<Ride> {
    return this.apiRidesService.completeRide(rideId).pipe(map((ride) => this.toRide(ride)));
  }

  /**
   * Отримати доступні поїздки для водія
   */
  getAvailableRidesForDriver(): Observable<Ride[]> {
    return this.apiRidesService.getAvailableRides().pipe(
      map((rides) =>
        rides.map((ride) => ({
          id: ride.id,
          passengerId: '',
          passengerName: ride.passengerName,
          pickupLocation: ride.pickupLocation,
          dropoffLocation: ride.dropoffLocation,
          pickupAddress: ride.pickupLocation.address,
          dropoffAddress: ride.dropoffLocation.address,
          status: ride.status,
          price: ride.price,
          distance: ride.distance,
          estimatedTime: ride.estimatedTime ?? 0,
          createdAt: new Date().toISOString()
        }))
      )
    );
  }

  /**
   * Оновити статус поїздки
   */
  updateRideStatus(rideId: string, status: string): Observable<Ride> {
    return this.apiRidesService.updateRideStatus(rideId, { status: status as any }).pipe(
      map((ride) => this.toRide(ride))
    );
  }

  /**
   * Отримати поїздку за ID
   */
  getRideById(rideId: string): Observable<Ride> {
    return this.apiRidesService.getRideById(rideId).pipe(map((ride) => this.toRide(ride)));
  }

  private toRide(ride: ApiRide): Ride {
    return {
      ...ride,
      pickupAddress: ride.pickupLocation?.address,
      dropoffAddress: ride.dropoffLocation?.address
    };
  }
}
