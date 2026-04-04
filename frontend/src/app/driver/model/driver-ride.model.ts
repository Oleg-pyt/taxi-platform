import { Point } from "../../map/model/point";

export interface DriverRide {
  rideId: string;
  pickupLocation: Point;
  dropoffLocation: Point;
  passengerName: string;
  price: number;
  distance: number;
}
