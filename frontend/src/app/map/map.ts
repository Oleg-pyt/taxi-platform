import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoginComponent } from '../auth/login/login';
import { RideHistoryDialogComponent } from '../ride-history-dialog/ride-history-dialog.component';
import { LocationService } from './service/location.service';
import { MapboxApiService } from './service/mapbox-api.service';
import { RideStateService, RideFormData } from './service/ride-state.service';
import { WebSocketService, RideStatus, RideUpdate } from './service/websocket.service';
import { RideService, CreateRideRequest, Ride } from './service/ride.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.scss'],
  standalone: false
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map!: Map;
  rideForm!: FormGroup;
  isBottomSheetOpen = false;
  userLocation: { lat: number; lng: number } | null = null;
  pickupMarker: Marker | null = null;
  dropoffMarker: Marker | null = null;
  pickupLocation: { lat: number; lng: number; address: string } | null = null;
  dropoffLocation: { lat: number; lng: number; address: string } | null = null;
  routePolyline: any = null;
  selectionMode: 'pickup' | 'dropoff' | null = null;
  isLoadingLocation = false;
  locationError: string | null = null;

  // Ride state
  activeRide: Ride | null = null;
  rideStatus: RideStatus | null = null;
  isCreatingRide = false;
  estimatedPrice = 0;
  estimatedDistance = 0;
  estimatedTime = 0;

  // Authentication
  isAuthenticated = false;
  isAuthDialogOpen = false;

  // Subscriptions
  private rideUpdateSubscription?: Subscription;
  private authDialogRef?: DynamicDialogRef;

  private readonly MAPBOX_TOKEN = 'TOKEN';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private dialogService: DialogService,
    private locationService: LocationService,
    private mapboxApiService: MapboxApiService,
    private rideStateService: RideStateService,
    private webSocketService: WebSocketService,
    private rideService: RideService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Перевірка авторизації
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth && !this.activeRide) {
        this.loadActiveRide();
      }
    });

    // Завантажити збережені дані поїздки
    this.loadSavedRideData();

    // Завантажити активну поїздку якщо є
    if (this.isAuthenticated) {
      this.loadActiveRide();
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.rideUpdateSubscription?.unsubscribe();
    this.authDialogRef?.close();
    if (this.isAuthenticated) {
      this.webSocketService.disconnect();
    }
  }

  /**
   * Ініціалізація форми замовлення
   */
  private initializeForm(): void {
    this.rideForm = this.formBuilder.group({
      pickupAddress: ['', Validators.required],
      dropoffAddress: ['', Validators.required]
    });

    // Слухати зміни в формі і зберігати в LocalStorage
    this.rideForm.valueChanges.subscribe(() => {
      this.saveFormData();
    });
  }

  /**
   * Завантажити збережені дані поїздки
   */
  private loadSavedRideData(): void {
    const savedData = this.rideStateService.getRideData();
    if (savedData) {
      this.rideForm.patchValue({
        pickupAddress: savedData.pickupAddress,
        dropoffAddress: savedData.dropoffAddress
      });
      this.pickupLocation = savedData.pickupLocation;
      this.dropoffLocation = savedData.dropoffLocation;
    }
  }

  /**
   * Зберегти дані форми в LocalStorage
   */
  private saveFormData(): void {
    const data: RideFormData = {
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      pickupAddress: this.rideForm.value.pickupAddress,
      dropoffAddress: this.rideForm.value.dropoffAddress
    };
    this.rideStateService.saveRideData(data);
  }

  /**
   * Завантажити активну поїздку
   */
  private loadActiveRide(): void {
    this.rideService.getActiveRide().subscribe({
      next: (ride) => {
        if (ride) {
          this.activeRide = ride;
          this.rideStatus = ride.status as RideStatus;
          this.pickupLocation = ride.pickupLocation;
          this.dropoffLocation = ride.dropoffLocation;
          this.rideForm.patchValue({
            pickupAddress: ride.pickupLocation?.address || ride.pickupAddress || '',
            dropoffAddress: ride.dropoffLocation?.address || ride.dropoffAddress || ''
          });
          if (this.map) {
            this.addPickupMarker(ride.pickupLocation.lat, ride.pickupLocation.lng);
            this.addDropoffMarker(ride.dropoffLocation.lat, ride.dropoffLocation.lng);
            this.drawRoute(
              [ride.pickupLocation.lng, ride.pickupLocation.lat],
              [ride.dropoffLocation.lng, ride.dropoffLocation.lat]
            );
          }
          this.connectWebSocket();
        }
      },
      error: (error) => {
        console.error('Error loading active ride:', error);
      }
    });
  }

  /**
   * Підключення до WebSocket
   */
  private connectWebSocket(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.webSocketService.connect(token);
    
    this.rideUpdateSubscription = this.webSocketService.onRideUpdate().subscribe({
      next: (update: RideUpdate) => {
        this.handleRideUpdate(update);
      }
    });
  }

  /**
   * Обробка оновлення поїздки
   */
  private handleRideUpdate(update: RideUpdate): void {
    this.rideStatus = update.status;
    
    if (this.activeRide && this.activeRide.id === update.rideId) {
      if (update.driverName) {
        this.activeRide.driverName = update.driverName;
      }
      this.activeRide.status = update.status;
    }

    // Локальна поїздка завершена / скасована
    if (update.status === RideStatus.COMPLETED || update.status === RideStatus.CANCELLED) {
      this.activeRide = null;
      this.rideStatus = null;
      this.webSocketService.disconnect();
    }
  }

  /**
   * Отримання поточного місцезнаходження користувача
   */
  private getCurrentLocation(): void {
    this.isLoadingLocation = true;
    this.locationError = null;

    this.locationService.getCurrentLocation().subscribe({
      next: (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.isLoadingLocation = false;
        if (this.map) {
          this.map.flyTo({
            center: [this.userLocation.lng, this.userLocation.lat],
            zoom: 14
          });
          this.addUserMarker();
          this.setPickupToCurrentLocation();
        }
      },
      error: (error) => {
        this.isLoadingLocation = false;
        this.locationError = 'Неможливо отримати місцезнаходження';
        console.error('Geolocation error:', error);
      }
    });
  }

  /**
   * Ініціалізація Mapbox карти
   */
  private initializeMap(): void {
    mapboxgl.accessToken = this.MAPBOX_TOKEN;

    this.getCurrentLocation();
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.userLocation ? [this.userLocation.lng, this.userLocation.lat] : this.locationService.getOldUserLocation(),
      zoom: 12
    });

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'top-right');

    this.map.addControl(new mapboxgl.ScaleControl());

    this.map.on('click', (e) => {
      if (this.selectionMode) {
        const { lng, lat } = e.lngLat;
        this.handleMapClick(lat, lng);
      }
    });

    this.map.on('mousemove', () => {
      if (this.selectionMode) {
        this.map.getCanvas().style.cursor = 'crosshair';
      }
    });

    // Відновити маркери якщо є збережені дані
    setTimeout(() => {
      if (this.pickupLocation) {
        this.addPickupMarker(this.pickupLocation.lat, this.pickupLocation.lng);
      }
      if (this.dropoffLocation) {
        this.addDropoffMarker(this.dropoffLocation.lat, this.dropoffLocation.lng);
      }
      if (this.pickupLocation && this.dropoffLocation) {
        this.drawRoute(
          [this.pickupLocation.lng, this.pickupLocation.lat],
          [this.dropoffLocation.lng, this.dropoffLocation.lat]
        );
      }
    }, 1000);
  }

  /**
   * Додавання маркера користувача на карту
   */
  private addUserMarker(): void {
    if (!this.userLocation) return;

    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    userEl.innerHTML = '�';
    userEl.style.fontSize = '28px';
    userEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

    new mapboxgl.Marker(userEl)
      .setLngLat([this.userLocation.lng, this.userLocation.lat])
      .addTo(this.map);
  }

  private async setPickupToCurrentLocation(): Promise<void> {
    if (this.userLocation && !this.pickupLocation) {
      const { lat, lng } = this.userLocation;
      const address = await this.mapboxApiService.getAddressFromCoordinates(lat, lng);
      
      this.pickupLocation = { lat, lng, address };
      this.rideForm.patchValue({
        pickupAddress: address
      });
      this.addPickupMarker(lat, lng);
    }
  }

  /**
   * Обробка кліку на карту
   */
  private async handleMapClick(lat: number, lng: number): Promise<void> {
    const address = await this.mapboxApiService.getAddressFromCoordinates(lat, lng);

    if (this.selectionMode === 'pickup') {
      this.pickupLocation = { lat, lng, address };
      this.rideForm.patchValue({
        pickupAddress: address
      });
      this.addPickupMarker(lat, lng);
    } else if (this.selectionMode === 'dropoff') {
      this.dropoffLocation = { lat, lng, address };
      this.rideForm.patchValue({
        dropoffAddress: address
      });
      this.addDropoffMarker(lat, lng);
    }

    if (this.pickupLocation && this.dropoffLocation) {
      await this.drawRoute(
        [this.pickupLocation.lng, this.pickupLocation.lat],
        [this.dropoffLocation.lng, this.dropoffLocation.lat]
      );
      await this.calculatePriceAndDistance();
    }

    this.selectionMode = null;
    this.map.getCanvas().style.cursor = 'auto';
  }

  private addPickupMarker(lat: number, lng: number): void {
    if (this.pickupMarker) {
      this.pickupMarker.remove();
    }

    const el = document.createElement('div');
    el.className = 'pickup-marker';
    el.innerHTML = '✓';
    el.style.fontSize = '26px';
    el.style.color = '#10b981';
    el.style.fontWeight = 'bold';
    el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

    this.pickupMarker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(this.map);
  }

  private addDropoffMarker(lat: number, lng: number): void {
    if (this.dropoffMarker) {
      this.dropoffMarker.remove();
    }

    const el = document.createElement('div');
    el.className = 'dropoff-marker';
    el.innerHTML = '✕';
    el.style.fontSize = '26px';
    el.style.color = '#ef4444';
    el.style.fontWeight = 'bold';
    el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

    this.dropoffMarker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(this.map);
  }

  private async drawRoute(start: [number, number], end: [number, number]): Promise<void> {
    const route = await this.mapboxApiService.getRoute(start, end);

    if (this.map.getSource('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }

    if (route) {
      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route
        }
      });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#667eea',
          'line-width': 5
        }
      });
    }
  }

  private async calculatePriceAndDistance(): Promise<void> {
    if (!this.pickupLocation || !this.dropoffLocation) return;

    try {
      // Call server to calculate price
      this.rideService.calculatePrice(
        this.pickupLocation,
        this.dropoffLocation
      ).subscribe({
        next: (response) => {
          this.estimatedDistance = Math.round(response.distance * 10) / 10;
          this.estimatedTime = Math.round(response.duration);
          this.estimatedPrice = response.price;
        },
        error: (error) => {
          console.error('Error calculating price:', error);
          // Fallback: calculate locally if server fails
          this.calculatePriceLocally();
        }
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      this.calculatePriceLocally();
    }
  }

  private async calculatePriceLocally(): Promise<void> {
    if (!this.pickupLocation || !this.dropoffLocation) return;

    const { distance, duration } = await this.mapboxApiService.getDistanceAndDuration(
      [this.pickupLocation.lng, this.pickupLocation.lat],
      [this.dropoffLocation.lng, this.dropoffLocation.lat]
    );

    this.estimatedDistance = Math.round(distance * 10) / 10;
    this.estimatedTime = Math.round(duration);
    this.estimatedPrice = Math.round(distance * 15 + 50); // Формула ціни: 15 грн/км + 50 грн базова ціна
  }

  selectPickupLocation(): void {
    this.selectionMode = 'pickup';
    this.isBottomSheetOpen = true;
  }

  selectDropoffLocation(): void {
    this.selectionMode = 'dropoff';
    this.isBottomSheetOpen = true;
  }

  closeBottomSheet(): void {
    this.isBottomSheetOpen = false;
    this.selectionMode = null;
    if (this.map) {
      this.map.getCanvas().style.cursor = 'auto';
    }
  }

  openLoginDialog(continueOrder = false): void {
    this.authDialogRef?.close();
    this.isAuthDialogOpen = true;
    const ref = this.dialogService.open(LoginComponent, {
      showHeader: false,
      width: '460px',
      modal: true,
      closable: false,
      dismissableMask: false,
      draggable: false,
      styleClass: 'auth-dialog',
      maskStyleClass: 'auth-dialog-mask',
      contentStyle: { overflow: 'hidden' },
      data: {
        asDialog: true,
        continueOrder
      }
    });
    if (!ref) {
      return;
    }

    this.authDialogRef = ref;

    ref.onClose.subscribe((result?: { authenticated?: boolean; continueOrder?: boolean }) => {
      this.authDialogRef = undefined;
      this.isAuthDialogOpen = false;
      if (result?.authenticated && result.continueOrder) {
        this.onOrderRide();
      }
    });
  }

  openRideHistoryDialog(): void {
    this.dialogService.open(RideHistoryDialogComponent, {
      header: 'Історія поїздок',
      width: '600px',
      modal: true,
      showHeader: true,
      styleClass: 'ride-history-dialog'
    });
  }

  onOrderRide(): void {
    if (this.rideForm.invalid || !this.pickupLocation || !this.dropoffLocation) {
      return;
    }

    if (!this.isAuthenticated) {
      this.closeBottomSheet();
      this.openLoginDialog(true);
      return;
    }

    this.isCreatingRide = true;

    const rideRequest: CreateRideRequest = {
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      price: this.estimatedPrice,
      distance: this.estimatedDistance,
      estimatedTime: this.estimatedTime
    };

    this.rideService.createRide(rideRequest).subscribe({
      next: (ride) => {
        this.activeRide = ride;
        this.rideStatus = ride.status as RideStatus;
        this.isCreatingRide = false;
        this.rideStateService.clearRideData();
        this.connectWebSocket();
      },
      error: (error) => {
        this.locationError = error.message || 'Помилка створення поїздки';
        this.isCreatingRide = false;
      }
    });
  }

  canSubmitOrder(): boolean {
    if (this.rideForm.invalid || !this.pickupLocation || !this.dropoffLocation) {
      return false;
    }

    if (this.isLoadingLocation || this.isCreatingRide) {
      return false;
    }

    // Для гостя дозволяємо перейти в логін навіть якщо ціна ще рахується.
    if (!this.isAuthenticated) {
      return true;
    }

    return this.estimatedPrice > 0;
  }

  cancelRide(): void {
    if (!this.activeRide) return;

    if (!confirm('Ви впевнені що хочете скасувати поїздку?')) {
      return;
    }

    this.webSocketService.cancelRide(this.activeRide.id);
  }

  resetForm(): void {
    this.rideForm.reset();
    this.pickupLocation = null;
    this.dropoffLocation = null;
    this.estimatedPrice = 0;
    this.estimatedDistance = 0;
    this.estimatedTime = 0;
    
    if (this.pickupMarker) this.pickupMarker.remove();
    if (this.dropoffMarker) this.dropoffMarker.remove();
    if (this.map && this.map.getSource('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
    
    this.rideStateService.clearRideData();
    this.selectionMode = null;
    if (this.map) {
      this.map.getCanvas().style.cursor = 'auto';
    }

    if (this.userLocation) {
      this.setPickupToCurrentLocation();
    } else {
      this.getCurrentLocation();
    }
  }

  getRideStatusText(status: RideStatus): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'Пошук водія...',
      'OFFERED': 'Запропоновано водію',
      'ACCEPTED': 'Водій прийняв замовлення',
      'IN_PROGRESS': 'Поїздка розпочалась',
      'COMPLETED': 'Поїздка завершена',
      'CANCELLED': 'Поїздка скасована',
      'EXPIRED': 'Час очікування вичерпано'
    };
    return statusMap[status] || status;
  }
}
