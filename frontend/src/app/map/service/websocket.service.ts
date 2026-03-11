import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environments';

export enum RideStatus {
  CREATED = 'CREATED',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface RideUpdate {
  rideId: string;
  status: RideStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: { lat: number; lng: number };
  estimatedArrival?: number;
  message?: string;
}

export interface DriverRideRequest {
  rideId: string;
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  passengerName: string;
  price: number;
  distance: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private rideUpdates = new Subject<RideUpdate>();
  private driverRideRequests = new Subject<DriverRideRequest>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000;
  private reconnectTimeout: any = null;

  constructor() {}

  /**
   * Підключення до WebSocket серверу
   */
  connect(token: string): void {
    if (this.socket && this.isConnected) {
      console.warn('WebSocket already connected');
      return;
    }

    const wsUrl = environment.wsUrl || environment.apiUrl.replace('http', 'ws');
    this.socket = new WebSocket(`${wsUrl}/rides?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.socket = null;
      this.attemptReconnect(token);
    };
  }

  /**
   * Відключення від WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Спроба повторного підключення
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(token);
      }, this.RECONNECT_DELAY);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  /**
   * Обробка повідомлень від сервера
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'RIDE_UPDATE':
        this.rideUpdates.next(message.data as RideUpdate);
        break;
      case 'DRIVER_RIDE_REQUEST':
        this.driverRideRequests.next(message.data as DriverRideRequest);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Відправити повідомлення до сервера
   */
  send(message: any): void {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  /**
   * Підписка на оновлення поїздки (для пасажирів)
   */
  onRideUpdate(): Observable<RideUpdate> {
    return this.rideUpdates.asObservable();
  }

  /**
   * Підписка на нові замовлення (для водіїв)
   */
  onDriverRideRequest(): Observable<DriverRideRequest> {
    return this.driverRideRequests.asObservable();
  }

  /**
   * Прийняти замовлення (водій)
   */
  acceptRide(rideId: string): void {
    this.send({
      type: 'ACCEPT_RIDE',
      data: { rideId }
    });
  }

  /**
   * Відхилити замовлення (водій)
   */
  rejectRide(rideId: string): void {
    this.send({
      type: 'REJECT_RIDE',
      data: { rideId }
    });
  }

  /**
   * Оновити локацію водія
   */
  updateDriverLocation(location: { lat: number; lng: number }): void {
    this.send({
      type: 'UPDATE_LOCATION',
      data: { location }
    });
  }

  /**
   * Скасувати поїздку
   */
  cancelRide(rideId: string): void {
    this.send({
      type: 'CANCEL_RIDE',
      data: { rideId }
    });
  }
}
