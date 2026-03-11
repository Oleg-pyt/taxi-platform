import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapboxApiService {
  private readonly MAPBOX_TOKEN = 'TOKEN';

  constructor(private http: HttpClient) {}

  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  async getRoute(start: [number, number], end: [number, number]): Promise<any> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${this.MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      }
      return null;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  async getDistanceAndDuration(start: [number, number], end: [number, number]): Promise<{ distance: number; duration: number }> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=${this.MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return {
          distance: data.routes[0].distance / 1000, // convert to km
          duration: data.routes[0].duration / 60 // convert to minutes
        };
      }
      return { distance: 0, duration: 0 };
    } catch (error) {
      console.error('Error getting distance:', error);
      return { distance: 0, duration: 0 };
    }
  }
}
