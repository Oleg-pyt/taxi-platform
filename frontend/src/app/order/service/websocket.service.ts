import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BaseWebSocketService } from '../../common/services/base-websocket.service';
import { OrderActions } from '../store/order.actions';
import { OrderState } from '../store/order.reducer';

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
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
  passengerName: string;
  price: number;
  distance: number;
}

@Injectable()
export class OrderWebSocketService extends BaseWebSocketService {
  constructor(private store: Store<OrderState>) {
    super();
  }

  protected onWebSocketOpen(): void {
    console.log('WebSocket connected');
  }

  protected onWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      this.handleMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, event.data);
      // this.connectionErrors.next(`Invalid message format: ${error}`);
    }
  }

  protected onWebSocketError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  protected onWebSocketClose(): void {
    console.log('WebSocket disconnected');
  }


  private handleMessage(message: any): void {
    if (!message.type || !message.data) {
      console.warn('Invalid message structure:', message);
      return;
    }

    switch (message.type) {
      case 'RIDE_UPDATE':
          this.store.dispatch(OrderActions.rideUpdateReceived({ update: message.data as RideUpdate }));
          this.store.dispatch(OrderActions.startActiveRideTracking());
          // this.rideUpdates.next(message.data as RideUpdate);
        break;
      case 'DRIVER_RIDE_REQUEST':
          // this.driverRideRequests.next(message.data as DriverRideRequest);
          // TODO: Dispatch action for driver ride requests if needed
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  // private onWebSocketOpen(): void {
  //   console.log('WebSocket connected');
  //   this.isConnected = true;
  //   this.reconnectAttempts = 0;
  //   this.currentReconnectDelay = this.INITIAL_RECONNECT_DELAY;
  //   this.connectionStatus.next(true);
  //   this.startHeartbeat();
  // }



  // private onWebSocketError(error: Event): void {
  //   console.error('WebSocket error:', error);
  //   this.connectionErrors.next('WebSocket connection error');
  // }

  // private onWebSocketClose(): void {
  //   console.warn('WebSocket connection closed');
  //   this.isConnected = false;
  //   this.connectionStatus.next(false);
  //   if (this.heartbeatTimeout) {
  //     clearTimeout(this.heartbeatTimeout);
  //     this.heartbeatTimeout = null;
  //   }
  //   this.attemptReconnect();
  // }

  // private startHeartbeat(): void {
  //   if (this.heartbeatTimeout) {
  //     clearTimeout(this.heartbeatTimeout);
  //   }
  //   this.heartbeatTimeout = setInterval(() => {
  //     if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
  //       // Send a ping by sending a heartbeat message
  //       // Note: Could also use WebSocket ping frames if server supports them
  //       console.log('Sending WebSocket heartbeat');
  //     }
  //   }, this.HEARTBEAT_INTERVAL);
  // }

  // private attemptReconnect(): void {
  //   if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS && this.currentToken) {
  //     this.reconnectAttempts++;
  //     console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);

  //     this.reconnectTimeout = setTimeout(() => {
  //       this.connect(this.currentToken!);
  //     }, this.currentReconnectDelay);

  //     // Exponential backoff: 3s, 6s, 12s, 24s, 30s (max)
  //     this.currentReconnectDelay = 1;
  //   } else if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
  //     console.error('Max reconnect attempts reached');
  //     this.connectionErrors.next('Connection lost. Please refresh the page to reconnect.');
  //   }
  // }

  // private send(message: any): void {
  //   if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
  //     const errorMsg = 'WebSocket is not connected. Cannot send message.';
  //     console.error(errorMsg, message);
  //     this.connectionErrors.next(errorMsg);
  //     return;
  //   }

  //   try {
  //     const payload = JSON.stringify(message);
  //     this.socket.send(payload);
  //     console.log('WebSocket message sent:', message);
  //   } catch (error) {
  //     console.error('Failed to send WebSocket message:', error);
  //     this.connectionErrors.next(`Failed to send message: ${error}`);
  //   }
  // }

  // public acceptRide(rideId: string): void {
  //   this.send({
  //     type: 'ACCEPT_RIDE',
  //     data: { rideId }
  //   });
  // }

  // public rejectRide(rideId: string): void {
  //   this.send({
  //     type: 'REJECT_RIDE',
  //     data: { rideId }
  //   });
  // }

  // public updateDriverLocation(location: { lat: number; lng: number }): void {
  //   this.send({
  //     type: 'UPDATE_LOCATION',
  //     data: { location }
  //   });
  // }

  // public cancelRide(rideId: string): void {
  //   this.send({
  //     type: 'CANCEL_RIDE',
  //     data: { rideId }
  //   });
  // }
}
