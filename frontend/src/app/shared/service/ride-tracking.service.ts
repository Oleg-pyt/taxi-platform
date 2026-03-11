import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { LocationService } from '../../map/service/location.service';
import { MapboxApiService } from '../../map/service/mapbox-api.service';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class RideTrackingService {
  private currentLocationSubject = new BehaviorSubject<Location | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  private trackingIntervalId: any;
  private readonly UPDATE_INTERVAL = 5000; // 5 сек

  constructor(
    private http: HttpClient,
    private locationService: LocationService,
    private mapboxApiService: MapboxApiService
  ) {}

  /**
   * Почати відслідження локації (для водія)
   */
  startTracking(onLocationUpdate?: (location: Location) => void): void {
    // Отримати поточну локацію один раз на старт
    this.locationService.getCurrentLocation().subscribe({
      next: (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.currentLocationSubject.next(location);
        if (onLocationUpdate) onLocationUpdate(location);
      }
    });

    // Потім оновлювати кожні 5 сек
    this.trackingIntervalId = setInterval(() => {
      this.locationService.getCurrentLocation().subscribe({
        next: (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.currentLocationSubject.next(location);
          if (onLocationUpdate) onLocationUpdate(location);
        }
      });
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Зупинити відслідження
   */
  stopTracking(): void {
    if (this.trackingIntervalId) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }
  }

  /**
   * Отримати маршрут до точки
   */
  async getRouteToLocation(from: Location, to: Location): Promise<Route> {
    const route = await this.mapboxApiService.getRoute([from.lng, from.lat], [to.lng, to.lat]);
    
    if (route && route.coordinates) {
      return {
        coordinates: route.coordinates,
        distance: route.distance || 0,
        duration: route.duration || 0
      };
    }

    return {
      coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
      distance: 0,
      duration: 0
    };
  }

  /**
   * Отримати подвійний маршрут (до пасажира, потім до пункту призначення)
   */
  async getDualRoute(driverLocation: Location, pickupLocation: Location, dropoffLocation: Location): Promise<{ pickup: Route; dropoff: Route }> {
    const pickupRoute = await this.getRouteToLocation(driverLocation, pickupLocation);
    const dropoffRoute = await this.getRouteToLocation(pickupLocation, dropoffLocation);

    return {
      pickup: pickupRoute,
      dropoff: dropoffRoute
    };
  }

  /**
   * Отримати поточну локацію
   */
  getCurrentLocation(): Location | null {
    return this.currentLocationSubject.value;
  }

  /**
   * Обчислити дистанцію між двома точками (Haversine formula)
   */
  calculateDistance(from: Location, to: Location): number {
    const R = 6371; // km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
