import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Ride } from '../../map/service/ride.service';

export interface AvailableRide extends Ride {
  passengerName: string;
  passengerRating: number;
  passengerPhone?: string;
  distance: number;
  estimatedDuration: number;
  estimatedPrice: number;
  pickupAddress: string;
  dropoffAddress: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface DriverRideStatus {
  status: 'ACCEPTED' | 'DRIVER_ARRIVED' | 'RIDE_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  updatedAt: Date;
  currentRide?: Ride;
}

@Injectable({
  providedIn: 'root'
})
export class DriverRideService {
  private apiUrl = environment.apiUrl + '/rides';
  private currentRideSubject = new BehaviorSubject<Ride | null>(null);
  public currentRide$ = this.currentRideSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Отримати список доступних замовлень в районі
   */
  getAvailableRides(latitude: number, longitude: number, radiusKm: number = 5, minRating: number = 0): Observable<AvailableRide[]> {
    // Backend currently provides available rides without geo filters.
    return this.http.get<AvailableRide[]>(`${this.apiUrl}/available`);
  }

  /**
   * Водій приймає замовлення
   */
  acceptRide(rideId: string): Observable<Ride> {
    return this.http.post<Ride>(`${this.apiUrl}/${rideId}/accept`, {});
  }

  /**
   * Отримати поточну активну поїздку водія
   */
  getCurrentRide(): Observable<Ride | null> {
    return this.http.get<Ride | null>(`${this.apiUrl}/active`);
  }

  /**
   * Оновити статус поїздки (ACCEPTED → DRIVER_ARRIVED → RIDE_STARTED → IN_PROGRESS → COMPLETED)
   */
  updateRideStatus(rideId: string, status: DriverRideStatus['status']): Observable<Ride> {
    return this.http.patch<Ride>(`${this.apiUrl}/${rideId}/status`, { status });
  }

  /**
   * Передати локацію водія (для реалтайм відслідження)
   */
  updateDriverLocation(latitude: number, longitude: number): Observable<void> {
    return of(void 0);
  }

  /**
   * Завантажити поточну поїздку локально
   */
  setCurrentRide(ride: Ride | null): void {
    this.currentRideSubject.next(ride);
  }

  /**
   * Отримати загальну поточну поїздку
   */
  getCurrentRideValue(): Ride | null {
    return this.currentRideSubject.value;
  }

  /**
   * Скасувати прийняту поїздку (якщо потрібно)
   */
  rejectRide(rideId: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${rideId}/cancel`, { reason });
  }
}
