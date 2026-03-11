import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DriverRideService, AvailableRide } from '../service/driver-ride.service';
import { RideTrackingService } from '../../shared/service/ride-tracking.service';
import { RideService } from '../../map/service/ride.service';
import { LocationService } from '../../map/service/location.service';
import { AuthService } from '../../auth/auth.service';
import mapboxgl, { Map } from 'mapbox-gl';

type RideStatus = 'assigned' | 'arrived' | 'in_progress' | 'completed';

@Component({
  selector: 'app-driver-active-ride',
  templateUrl: './driver-active-ride.component.html',
  styleUrls: ['./driver-active-ride.component.scss'],
  standalone: false
})
export class DriverActiveRideComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map!: Map;
  ride: AvailableRide | null = null;
  loading = false;
  error: string | null = null;
  
  currentStatus: RideStatus = 'assigned';
  driverLocation: { lat: number; lng: number } | null = null;
  estimatedPickupTime: number | null = null; // у хвилинах
  estimatedDropoffTime: number | null = null;
  currentRoute: any = null;
  dropoffRoute: any = null;

  private readonly MAPBOX_TOKEN = 'TOKEN';
  private updateInterval: any;

  statusSteps: { label: string; value: RideStatus }[] = [
    { label: 'Прибув', value: 'arrived' },
    { label: 'Пасажир в авто', value: 'in_progress' },
    { label: 'Завершити', value: 'completed' }
  ];

  constructor(
    private driverRideService: DriverRideService,
    private rideTrackingService: RideTrackingService,
    private rideService: RideService,
    private locationService: LocationService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentRide();
    this.startLocationTracking();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.stopLocationTracking();
    if (this.map) {
      this.map.remove();
    }
  }

  private loadCurrentRide(): void {
    const currentRide = this.driverRideService.getCurrentRideValue();
    
    if (!currentRide) {
      this.error = 'Немає активного замовлення';
      return;
    }

    // this.ride = currentRide;
    this.currentStatus = (currentRide.status as RideStatus) || 'assigned';
  }

  private initializeMap(): void {
    if (!this.ride) return;

    mapboxgl.accessToken = this.MAPBOX_TOKEN;
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.ride.pickupLocation.lng, this.ride.pickupLocation.lat],
      zoom: 13
    });

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    this.map.addControl(new mapboxgl.ScaleControl());

    this.map.on('load', () => {
      this.drawRoutes();
      this.addMarkers();
    });
  }

  private drawRoutes(): void {
    if (!this.ride || !this.driverLocation) return;

    // Маршрут від водія до пасажира
    this.rideTrackingService
      .getRouteToLocation(
        { lat: this.driverLocation.lat, lng: this.driverLocation.lng },
        { lat: this.ride.pickupLocation.lat, lng: this.ride.pickupLocation.lng }
      )
      .then((route) => {
        this.currentRoute = route;
        this.estimatedPickupTime = route.duration ? Math.ceil(route.duration / 60) : null;
        this.drawRoute(route, '#2196F3', 'pickup-route');
      })
      .catch((error) => {
        console.error('Error calculating route to pickup:', error);
      });

    // Маршрут від пасажира до пункту призначення
    this.rideTrackingService
      .getRouteToLocation(
        { lat: this.ride.pickupLocation.lat, lng: this.ride.pickupLocation.lng },
        { lat: this.ride.dropoffLocation.lat, lng: this.ride.dropoffLocation.lng }
      )
      .then((route) => {
        this.dropoffRoute = route;
        this.estimatedDropoffTime = route.duration ? Math.ceil(route.duration / 60) : null;
        this.drawRoute(route, '#ff9800', 'dropoff-route');
      })
      .catch((error) => {
        console.error('Error calculating route to dropoff:', error);
      });
  }

  private drawRoute(route: any, color: string, id: string): void {
    if (!this.map || !route.geometry) return;

    if (this.map.getSource(id)) {
      (this.map.getSource(id) as any).setData(route.geometry);
    } else {
      this.map.addSource(id, {
        type: 'geojson',
        data: route.geometry
      });

      this.map.addLayer({
        id: id,
        type: 'line',
        source: id,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    }
  }

  private addMarkers(): void {
    if (!this.ride || !this.driverLocation || !this.map) return;

    // Маркер водія (👤)
    const driverEl = document.createElement('div');
    driverEl.innerHTML = '👤';
    driverEl.style.fontSize = '24px';
    driverEl.style.cursor = 'default';

    new mapboxgl.Marker(driverEl)
      .setLngLat([this.driverLocation.lng, this.driverLocation.lat])
      .addTo(this.map);

    // Маркер пасажира (📍)
    const pickupEl = document.createElement('div');
    pickupEl.innerHTML = '📍';
    pickupEl.style.fontSize = '28px';
    pickupEl.style.cursor = 'default';
    pickupEl.style.filter = 'drop-shadow(0 0 4px #2196F3)';

    new mapboxgl.Marker(pickupEl)
      .setLngLat([this.ride.pickupLocation.lng, this.ride.pickupLocation.lat])
      .addTo(this.map);

    // Маркер пункту призначення (🎯)
    const dropoffEl = document.createElement('div');
    dropoffEl.innerHTML = '🎯';
    dropoffEl.style.fontSize = '28px';
    dropoffEl.style.cursor = 'default';
    dropoffEl.style.filter = 'drop-shadow(0 0 4px #ff9800)';

    new mapboxgl.Marker(dropoffEl)
      .setLngLat([this.ride.dropoffLocation.lng, this.ride.dropoffLocation.lat])
      .addTo(this.map);
  }

  private startLocationTracking(): void {
    this.rideTrackingService.startTracking();

    this.updateInterval = setInterval(() => {
      this.locationService.getCurrentLocation().subscribe({
        next: (position) => {
          this.driverLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Оновити маршрут якщо водій в русі
          if (this.currentStatus === 'assigned') {
            this.drawRoutes();
          }

          // Оновити локацію на сервері
          this.driverRideService.updateDriverLocation(
            position.coords.latitude,
            position.coords.longitude
          ).subscribe({
            error: (error) => console.error('Error updating location:', error)
          });
        },
        error: (error) => console.error('Geolocation error:', error)
      });
    }, 5000); // Оновлювати кожні 5 секунд
  }

  private stopLocationTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.rideTrackingService.stopTracking();
  }

  updateStatus(newStatus: RideStatus): void {
    if (!this.ride || this.loading) return;

    this.loading = true;
    this.error = null;

    this.rideService.updateRideStatus(this.ride.id, newStatus).subscribe({
      next: (updatedRide: any) => {
        this.currentStatus = newStatus;
        this.ride = { ...this.ride, ...updatedRide } as AvailableRide; // Оновити дані замовлення

        if (newStatus === 'completed') {
          // Перейти на сторінку оцінки
          setTimeout(() => {
            this.router.navigate(['/driver/rating', this.ride!.id]);
          }, 1000);
        }

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Помилка оновлення статусу. Спробуйте ще раз.';
        this.loading = false;
        console.error('Error updating ride status:', error);
      }
    });
  }

  canAdvanceStatus(): boolean {
    const currentIndex = this.statusSteps.findIndex(s => s.value === this.currentStatus);
    return currentIndex >= 0 && currentIndex < this.statusSteps.length - 1;
  }

  getNextStatusLabel(): string {
    const currentIndex = this.statusSteps.findIndex(s => s.value === this.currentStatus);
    if (currentIndex >= 0 && currentIndex < this.statusSteps.length - 1) {
      return this.statusSteps[currentIndex + 1].label;
    }
    return 'Завершено';
  }

  getNextStatus(): RideStatus {
    const currentIndex = this.statusSteps.findIndex(s => s.value === this.currentStatus);
    if (currentIndex >= 0 && currentIndex < this.statusSteps.length - 1) {
      return this.statusSteps[currentIndex + 1].value;
    }
    return 'completed';
  }

  cancelRide(): void {
    if (!this.ride || this.loading) return;

    const confirmCancel = confirm('Ви дійсно хочете скасувати замовлення?');
    if (!confirmCancel) return;

    this.loading = true;
    this.rideService.updateRideStatus(this.ride.id, 'cancelled').subscribe({
      next: () => {
        this.driverRideService.setCurrentRide(null);
        this.router.navigate(['/driver/available-rides']);
      },
      error: (error) => {
        this.error = 'Помилка скасування замовлення';
        this.loading = false;
        console.error('Error cancelling ride:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/driver/available-rides']);
  }
}
