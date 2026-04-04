import {
    Component,
    ViewChild,
    ElementRef,
    Input,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
    AfterViewInit,
    HostListener
} from '@angular/core';

import mapboxgl, { Map as MapBox, Marker } from 'mapbox-gl';

import { environment } from '../../environments/environments';
import { Point } from './model/point';
import { PointType } from './model/point-type';
import { LocationService } from './service/location.service';
import { MapboxApiService } from './service/mapbox-api.service';

@Component({
    selector: 'map',
    templateUrl: './map.html',
    styleUrls: ['./map.scss'],
    standalone: false
})
export class MapComponent implements OnChanges, AfterViewInit {
    @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

    private readonly MAPBOX_TOKEN = environment.mapbox?.token;

    private map!: MapBox;

    @Input()
    public roadMarkers: Point[] = [];
    @Input()
    public additionalMarkers: Point[] = [];
    @Input()
    public selectionMode: PointType | null = null;

    @Output()
    public onMapClick = new EventEmitter<Point>();
    @Output()
    public onUserLocationChange = new EventEmitter<Point>();
    
    public userLocation: Point | null = null;
    private followUserLocation = true;

    private markerRegistry: Map<PointType, Marker> = new Map<PointType, Marker>();

    constructor(
        private locationService: LocationService,
        private mapboxApiService: MapboxApiService
    ) { }

    public ngOnChanges(changes: SimpleChanges): void {
        if ((changes['roadMarkers'] || changes['additionalMarkers']) && this.map) {
            this.syncMapState();
        }
    }

    public ngAfterViewInit(): void {
        if (!this.MAPBOX_TOKEN) {
            console.error('Mapbox token is not set. Please provide a valid token in the environment configuration.');
        } else {
            this.initializeMap().catch((error) => {
                console.error('Failed to initialize map', error);
            });
        }
    }

    @HostListener('window:resize')
    public onWindowResize(): void {
        if (this.map) {
            this.map.resize();
        }
    }

    private async syncMapState(): Promise<void> {
        const markers = [...this.roadMarkers, ...this.additionalMarkers];
        const activeMarkerTypes = new Set(markers.map((marker) => marker.pointType));

        if (this.userLocation) {
            activeMarkerTypes.add(PointType.USER_LOCATION);
        }

        for (const [pointType, marker] of this.markerRegistry.entries()) {
            if (!activeMarkerTypes.has(pointType)) {
                marker.remove();
                this.markerRegistry.delete(pointType);
            }
        }

        markers.forEach((marker) => {
            this.addMarker(marker);
        });

        if (this.userLocation) {
            this.addMarker(this.userLocation);
        }

        if (this.roadMarkers.length > 1) {
            await this.drawRoute();
            return;
        }

        this.clearRoute();
    }

    private clearRoute(): void {
        if (this.map.getLayer('route')) {
            this.map.removeLayer('route');
        }

        if (this.map.getSource('route')) {
            this.map.removeSource('route');
        }
    }

    private async drawRoute(): Promise<void> {
        const start = this.roadMarkers[0];
        const end = this.roadMarkers[1];
        const route = await this.mapboxApiService.getRoute([start.lng, start.lat], [end.lng, end.lat]);

        this.clearRoute();

        if (!route) {
            return;
        }

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
                'line-color': '#FA8112',
                'line-width': 5
            }
        });
    }

    private async initializeMap(): Promise<void> {
        mapboxgl.accessToken = this.MAPBOX_TOKEN;
        this.map = new mapboxgl.Map({
            container: this.mapContainer.nativeElement,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: this.userLocation ? [this.userLocation.lng, this.userLocation.lat] : this.locationService.getOldUserLocation(),
            zoom: 12
        });

        this.map.on('dragstart', () => {
            this.followUserLocation = false;
        });

        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: false
        });
        this.map.addControl(geolocateControl, 'top-right');

        geolocateControl.on('geolocate', (position: GeolocationPosition) => {
            this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                pointType: PointType.USER_LOCATION
            };

            this.addMarker(this.userLocation);
            this.onUserLocationChange.emit(this.userLocation);

            if (this.followUserLocation) {
                this.map.easeTo({
                    center: [this.userLocation.lng, this.userLocation.lat],
                    duration: 700
                });
            }
        });

        geolocateControl.on('error', (error: GeolocationPositionError) => {
            const [lng, lat] = this.locationService.getOldUserLocation();
            this.userLocation = { lat, lng, pointType: PointType.USER_LOCATION };
            console.warn('Geolocation unavailable, map centered to fallback location.', error);
        });

        this.map.addControl(new mapboxgl.ScaleControl());
        this.map.on('load', () => {
            this.map.resize();
            geolocateControl.trigger();
        });
        this.map.on('click', (e) => {
            console.log(e);
            if (this.selectionMode) {
                const { lng, lat } = e.lngLat;
                this.onMapClick.emit({ lng, lat, pointType: this.selectionMode } as Point);
                this.map.getCanvas().style.cursor = 'auto';
            }
        });
        this.map.on('mousemove', () => {
            if (this.selectionMode) {
                this.map.getCanvas().style.cursor = 'crosshair';
            }
        });
        this.syncMapState();
    }

    private addMarker(point: Point): void {
        const existingMarker = this.markerRegistry.get(point.pointType);
        if (existingMarker) {
            existingMarker.remove();
        }
        const el = document.createElement('div'); // todo: add customized markers
        if (point.pointType === PointType.USER_LOCATION) {
            el.className = 'user-location-marker';
            el.style.width = '14px';
            el.style.height = '14px';
            el.style.borderRadius = '50%';
            el.style.background = '#3b82f6';
            el.style.border = '2px solid #ffffff';
            // el.style.boxShadow = '0 0 0 6px rgba(59,130,246,0.25)';
        } else if (point.pointType === PointType.DRIVER_LOCATION) {
            el.className = 'driver-location-marker';
            el.style.width = '18px';
            el.style.height = '18px';
            el.style.borderRadius = '50%';
            el.style.background = '#FA8112';
            el.style.border = '3px solid #ffffff';
            el.style.boxShadow = '0 0 0 7px rgba(250,129,18,0.20)';
        } else {
            el.className = 'dropoff-marker';
            el.innerHTML = 'x';
            el.style.fontSize = '24px';
            el.style.color = '#ef4444';
            el.style.fontWeight = 'bold';
            el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        }

        const marker = new mapboxgl.Marker(el).setLngLat([point.lng, point.lat]).addTo(this.map);
        this.markerRegistry.set(point.pointType, marker);
    }
}
