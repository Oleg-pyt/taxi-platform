import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { WebSocketService, DriverRideRequest, RideStatus } from '../map/service/websocket.service';
import { RideService, Ride } from '../map/service/ride.service';

@Component({
  selector: 'app-driver-panel',
  templateUrl: './driver-panel.html',
  styleUrls: ['./driver-panel.scss'],
  standalone: false
})
export class DriverPanelComponent implements OnInit, OnDestroy {
  isOnline = false;
  currentRide: Ride | null = null;
  availableRides: DriverRideRequest[] = [];
  rideRequestsSubscription?: Subscription;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private rideService: RideService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Перевірка чи користувач є водієм
    if (!this.authService.isDriver()) {
      this.router.navigate(['/map']);
      return;
    }

    this.loadCurrentRide();
  }

  ngOnDestroy(): void {
    if (this.isOnline) {
      this.toggleOnline();
    }
    this.rideRequestsSubscription?.unsubscribe();
  }

  loadCurrentRide(): void {
    this.loading = true;
    this.rideService.getActiveRide().subscribe({
      next: (ride) => {
        this.currentRide = ride;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Помилка завантаження активної поїздки';
        this.loading = false;
      }
    });
  }

  toggleOnline(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isOnline) {
      // Перейти в офлайн
      this.webSocketService.disconnect();
      this.isOnline = false;
      this.availableRides = [];
      this.rideRequestsSubscription?.unsubscribe();
    } else {
      // Перейти в онлайн
      this.webSocketService.connect(token);
      this.isOnline = true;
      
      // Підписатись на нові замовлення
      this.rideRequestsSubscription = this.webSocketService.onDriverRideRequest().subscribe({
        next: (request) => {
          // Додати нове замовлення до списку
          this.availableRides.unshift(request);
          // Видалити після 30 секунд
          setTimeout(() => {
            this.removeRideRequest(request.rideId);
          }, 30000);
        }
      });
    }
  }

  removeRideRequest(rideId: string): void {
    this.availableRides = this.availableRides.filter(r => r.rideId !== rideId);
  }

  acceptRide(rideId: string): void {
    this.loading = true;
    this.webSocketService.acceptRide(rideId);
    this.removeRideRequest(rideId);
    
    // Завантажити оновлену інформацію
    setTimeout(() => {
      this.loadCurrentRide();
    }, 1000);
  }

  rejectRide(rideId: string): void {
    this.webSocketService.rejectRide(rideId);
    this.removeRideRequest(rideId);
  }

  completeRide(): void {
    if (!this.currentRide) return;

    this.loading = true;
    this.rideService.completeRide(this.currentRide.id).subscribe({
      next: () => {
        this.currentRide = null;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Помилка завершення поїздки';
        this.loading = false;
      }
    });
  }

  cancelRide(): void {
    if (!this.currentRide) return;

    if (!confirm('Ви впевнені що хочете скасувати поїздку?')) {
      return;
    }

    this.loading = true;
    this.rideService.cancelRide(this.currentRide.id).subscribe({
      next: () => {
        this.currentRide = null;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Помилка скасування поїздки';
        this.loading = false;
      }
    });
  }

  getRideStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'Створено',
      'OFFERED': 'Запропоновано',
      'ACCEPTED': 'Прийнято',
      'IN_PROGRESS': 'В дорозі',
      'COMPLETED': 'Завершено',
      'CANCELLED': 'Скасовано',
      'EXPIRED': 'Прострочено'
    };
    return statusMap[status] || status;
  }
}
