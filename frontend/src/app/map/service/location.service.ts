import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() {}

  getCurrentLocation(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            observer.next(position);
            observer.complete();
          },
          error => observer.error(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        observer.error('Geolocation not supported');
      }
    });
  }

  getOldUserLocation(): [number, number] {
    // Бидгощ за замовчуванням
    return [18.0084, 53.1235];
  }
}
