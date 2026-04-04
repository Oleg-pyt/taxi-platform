import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { DriverActions } from '../store/driver.actions';
import { DriverState } from '../store/driver.reducer';
import { selectCurrentRide } from '../store/driver.reducer';
import { DriverRide } from '../model/driver-ride.model';
import { Point } from "../../map/model/point";
import { PointType } from 'src/app/map/model/point-type';
import { DriverService } from '../services/driver.service';

@Component({
  selector: 'ride-search',
  templateUrl: './ride-search.html',
  styleUrls: ['./ride-search.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RideSearchComponent implements OnDestroy {
  @Input()
  public currentRide: DriverRide | null = null;

  private subscription = new Subscription();

  constructor(
    private store: Store<DriverState>,
    private driverService: DriverService
  ) {}

  public acceptRide(): void {
    if (this.currentRide) {
      this.store.dispatch(DriverActions.acceptRide());
      this.driverService.acceptRide(this.currentRide.rideId);
    }
  }

  public rejectRide(): void {
    if (this.currentRide) {
      this.store.dispatch(DriverActions.rejectRide());
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
