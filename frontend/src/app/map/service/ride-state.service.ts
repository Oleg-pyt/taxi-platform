import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RideFormData {
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  pickupAddress: string;
  dropoffAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideStateService {
  private readonly STORAGE_KEY = 'pendingRideData';
  private rideDataSubject = new BehaviorSubject<RideFormData | null>(this.loadFromStorage());
  public rideData$ = this.rideDataSubject.asObservable();

  constructor() {}

  /**
   * Зберегти дані поїздки
   */
  saveRideData(data: RideFormData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.rideDataSubject.next(data);
  }

  /**
   * Отримати збережені дані поїздки
   */
  getRideData(): RideFormData | null {
    return this.rideDataSubject.value;
  }

  /**
   * Очистити дані поїздки
   */
  clearRideData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.rideDataSubject.next(null);
  }

  /**
   * Завантажити дані з LocalStorage
   */
  private loadFromStorage(): RideFormData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading ride data from storage:', error);
      return null;
    }
  }
}
