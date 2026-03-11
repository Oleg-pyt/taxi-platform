import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingService } from '../../shared/service/rating.service';
import { DriverRideService } from '../service/driver-ride.service';
import { RideService } from '../../map/service/ride.service';

@Component({
  selector: 'app-ride-completion',
  templateUrl: './ride-completion.component.html',
  styleUrls: ['./ride-completion.component.scss'],
  standalone: false
})
export class RideCompletionComponent implements OnInit {
  rideId: string = '';
  passengerName: string = '';
  passengerRating: number = 0;
  review: string = '';
  rating: number = 0;
  hoverRating: number = 0;
  loading = false;
  error: string | null = null;
  submitted = false;

  rideDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ratingService: RatingService,
    private driverRideService: DriverRideService,
    private rideService: RideService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.rideId = params['rideId'];
      this.loadRideDetails();
    });
  }

  private loadRideDetails(): void {
    if (this.rideId) {
      this.rideService.getRideById(this.rideId).subscribe({
        next: (ride: any) => {
          this.rideDetails = ride;
          this.passengerName = ride.passengerName || 'Пассажир';
          this.passengerRating = ride.passengerRating || 0;
        },
        error: (error) => {
          console.error('Error loading ride details:', error);
          this.passengerName = 'Пассажир';
        }
      });
    }
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  setHoverRating(stars: number): void {
    this.hoverRating = stars;
  }

  clearHoverRating(): void {
    this.hoverRating = 0;
  }

  getStarArray(): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  submitRating(): void {
    if (this.rating === 0) {
      this.error = 'Будь ласка, виберіть оцінку';
      return;
    }

    this.loading = true;
    this.error = null;

    this.ratingService.submitRating(this.rideId, this.rating, this.review).subscribe({
      next: (rating) => {
        this.submitted = true;
        this.driverRideService.setCurrentRide(null);
        
        // Перейти на доступні замовлення через 2 секунди
        setTimeout(() => {
          this.router.navigate(['/driver/available-rides']);
        }, 2000);
      },
      error: (error) => {
        this.error = 'Помилка надання оцінки. Спробуйте ще раз.';
        this.loading = false;
        console.error('Error submitting rating:', error);
      }
    });
  }

  skip(): void {
    this.driverRideService.setCurrentRide(null);
    this.router.navigate(['/driver/available-rides']);
  }
}
