import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  public getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        reject('Geolocation not supported');
      }
    });
  }

  public getOldUserLocation(): [number, number] {
    // Бидгощ за замовчуванням
    return [18.0084, 53.1235];
  }
}
