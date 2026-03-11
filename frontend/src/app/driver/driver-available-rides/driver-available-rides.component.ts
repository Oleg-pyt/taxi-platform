import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DriverRideService, AvailableRide } from '../service/driver-ride.service';
import { LocationService } from '../../map/service/location.service';
import { AuthService } from '../../auth/auth.service';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import { Store } from '@ngrx/store';
import * as DriverActions from '../../store/driver/driver.actions';
import { selectDriverAvailableRides, selectDriverError, selectDriverLoading } from '../../store/driver/driver.selectors';
import { Subscription } from 'rxjs';

type MarkerRegistry = globalThis.Map<string, Marker>;

@Component({
  selector: 'app-driver-available-rides',
  templateUrl: './driver-available-rides.component.html',
  styleUrls: ['./driver-available-rides.component.scss'],
  standalone: false
})
export class DriverAvailableRidesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map!: Map;
  rides: AvailableRide[] = [];
  filteredRides: AvailableRide[] = [];
  loading = false;
  error: string | null = null;
  selectedRideId: string | null = null;
  userLocation: { lat: number; lng: number } | null = null;
  markers: MarkerRegistry = new globalThis.Map<string, Marker>();

  sortBy: 'distance' | 'price' = 'distance';
  filterMinRating = 0;

  private readonly MAPBOX_TOKEN = 'TOKEN';
  private subscriptions: Subscription[] = [];

  constructor(
    private driverRideService: DriverRideService,
    private locationService: LocationService,
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.bindStore();
    this.loadUserLocation();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.clearMarkers();
    if (this.map) {
      this.map.remove();
    }
  }

  private bindStore(): void {
    this.subscriptions.push(
      this.store.select(selectDriverAvailableRides).subscribe((rides) => {
        this.rides = rides as AvailableRide[];
        this.applyFilters();
      })
    );

    this.subscriptions.push(
      this.store.select(selectDriverLoading).subscribe((loading) => {
        this.loading = loading;
      })
    );

    this.subscriptions.push(
      this.store.select(selectDriverError).subscribe((error) => {
        this.error = error;
      })
    );
  }

  private loadUserLocation(): void {
    this.locationService.getCurrentLocation().subscribe({
      next: (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (this.map) {
          this.loadAvailableRides();
        } else if (this.mapContainer) {
          this.initializeMap();
        }
      },
      error: (error) => {
        this.error = 'Не вдалось отримати вашу локацію';
        console.error('Geolocation error:', error);
      }
    });
  }

  private initializeMap(): void {
    if (!this.userLocation) {
      this.error = 'Чекаємо на вашу локацію...';
      return;
    }

    mapboxgl.accessToken = this.MAPBOX_TOKEN;
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.userLocation.lng, this.userLocation.lat],
      zoom: 14
    });

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    this.map.addControl(new mapboxgl.ScaleControl());

    this.map.on('load', () => {
      this.loadAvailableRides();
    });
  }

  private loadAvailableRides(): void {
    if (!this.userLocation) return;

    this.store.dispatch(DriverActions.loadAvailableRides());
  }

  private addMarkersToMap(): void {
    this.clearMarkers();

    this.filteredRides.forEach((ride) => {
      if (ride.pickupLocation) {
        const el = document.createElement('div');
        el.className = 'ride-marker';
        el.innerHTML = '📌';
        el.style.fontSize = '28px';
        el.style.cursor = 'pointer';
        el.style.filter = this.selectedRideId === ride.id ? 'drop-shadow(0 0 8px #667eea)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([ride.pickupLocation.lng, ride.pickupLocation.lat])
          .addTo(this.map);

        el.addEventListener('click', () => this.selectRide(ride.id));
        this.markers.set(ride.id, marker);
      }
    });
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
  }

  selectRide(rideId: string): void {
    this.selectedRideId = rideId;
    this.addMarkersToMap(); // Оновити виділення
  }

  applyFilters(): void {
    this.filteredRides = [...this.rides];

    // Сортування
    if (this.sortBy === 'distance') {
      this.filteredRides.sort((a, b) => a.distance - b.distance);
    } else if (this.sortBy === 'price') {
      this.filteredRides.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
    }

    this.addMarkersToMap();
  }

  onSortChange(event: any): void {
    this.sortBy = event.target.value as 'distance' | 'price';
    this.applyFilters();
  }

  onFilterChange(event: any): void {
    this.filterMinRating = +event.target.value;
    this.loadAvailableRides();
  }

  acceptRide(ride: AvailableRide): void {
    this.loading = true;

    this.driverRideService.acceptRide(ride.id).subscribe({
      next: (acceptedRide) => {
        this.driverRideService.setCurrentRide(acceptedRide);
        this.router.navigate(['/driver/active-ride']);
      },
      error: (error) => {
        this.error = 'Помилка прийняття замовлення. Спробуйте ще раз.';
        this.loading = false;
        console.error('Error accepting ride:', error);
      }
    });
  }

  getSelectedRide(): AvailableRide | undefined {
    return this.filteredRides.find(r => r.id === this.selectedRideId);
  }

  refreshRides(): void {
    this.loadAvailableRides();
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }
}
