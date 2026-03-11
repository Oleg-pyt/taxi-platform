import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { RideService, Ride } from '../map/service/ride.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ride-history-dialog',
  templateUrl: './ride-history-dialog.component.html',
  styleUrls: ['./ride-history-dialog.component.scss'],
  standalone: false
})
export class RideHistoryDialogComponent implements OnInit, OnDestroy {
  rides: Ride[] = [];
  isLoading = true;
  isEmpty = false;
  error: string | null = null;
  private subscription?: Subscription;

  constructor(
    private rideService: RideService,
    public dialogRef: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.loadRideHistory();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadRideHistory(): void {
    this.isLoading = true;
    this.error = null;

    // Fetch completed and cancelled rides
    this.subscription = this.rideService.getRideHistory().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response?.empty || !response?.data || response.data.length === 0) {
          this.isEmpty = true;
          this.rides = [];
        } else {
          this.isEmpty = false;
          this.rides = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.isEmpty = true;
        this.error = 'Не удалось загрузить историю поездок';
        console.error('Error loading ride history:', error);
      }
    });
  }

  getRideStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'COMPLETED': 'Завершена',
      'CANCELLED': 'Скасована',
      'IN_PROGRESS': 'В процесі',
      'CREATED': 'Створена'
    };
    return statusMap[status] || status;
  }

  getRideStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  retry(): void {
    this.loadRideHistory();
  }

  trackByRideId(index: number, ride: Ride): string {
    return ride.id;
  }
}
