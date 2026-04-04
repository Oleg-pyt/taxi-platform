import { Injectable } from "@angular/core";
import { RidesService } from "@benatti/api";

@Injectable()
export class DriverService {
    constructor(private rideApiService: RidesService) {}

    public acceptRide(rideId: string) {
        this.rideApiService.acceptRide(rideId).subscribe({
            error: (error) => console.error('Failed to accept ride', error)
        });
    }
}
