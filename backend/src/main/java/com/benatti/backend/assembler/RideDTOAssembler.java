package com.benatti.backend.assembler;

import com.benatti.backend.entity.RideEntity;
import com.benatti.api.model.ActiveRideResponse;
import com.benatti.api.model.Location;
import com.benatti.api.model.Ride;
import com.benatti.api.model.RideAvailable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class RideDTOAssembler {
    public Ride toRide(RideEntity entity, String passengerName, String driverName) {
        Ride ride = new Ride();
        if (entity == null) {
            return ride;
        }
        ride.setId(entity.getId());
        ride.setPassengerId(entity.getRiderId());
        ride.setPassengerName(passengerName);
        if (entity.getDriverId() != null) {
            ride.setDriverId(entity.getDriverId());
        }
        if (driverName != null) {
            ride.setDriverName(driverName);
        }
        ride.setPickupLocation(toLocation(entity.getPickupLat(), entity.getPickupLng(), entity.getPickupAddress()));
        ride.setDropoffLocation(toLocation(entity.getDropoffLat(), entity.getDropoffLng(), entity.getDropoffAddress()));
        ride.setStatus(entity.getStatus());
        ride.setPrice(entity.getEstimatedPrice());
        ride.setDistance(entity.getDistance());
        ride.setEstimatedTime(entity.getEstimatedTime());
        ride.setCreatedAt(toOffset(entity.getCreatedAt()));
        if (entity.getAssignedAt() != null) {
            ride.setAcceptedAt(toOffset(entity.getAssignedAt()));
        }
        if (entity.getCompletedAt() != null) {
            ride.setCompletedAt(toOffset(entity.getCompletedAt()));
        }
        return ride;
    }

    public ActiveRideResponse toActiveRide(RideEntity entity, String passengerName, String driverName) {
        ActiveRideResponse ride = new ActiveRideResponse();
        if (entity == null) {
            return ride;
        }
        ride.setId(entity.getId());
        ride.setPassengerId(entity.getRiderId());
        ride.setPassengerName(passengerName);
        if (entity.getDriverId() != null) {
            ride.setDriverId(entity.getDriverId());
        }
        if (driverName != null) {
            ride.setDriverName(driverName);
        }
        ride.setPickupLocation(toLocation(entity.getPickupLat(), entity.getPickupLng(), entity.getPickupAddress()));
        ride.setDropoffLocation(toLocation(entity.getDropoffLat(), entity.getDropoffLng(), entity.getDropoffAddress()));
        ride.setStatus(entity.getStatus());
        ride.setPrice(entity.getEstimatedPrice());
        ride.setDistance(entity.getDistance());
        ride.setEstimatedTime(entity.getEstimatedTime());
        ride.setCreatedAt(toOffset(entity.getCreatedAt()));
        if (entity.getAssignedAt() != null) {
            ride.setAcceptedAt(toOffset(entity.getAssignedAt()));
        }
        if (entity.getCompletedAt() != null) {
            ride.setCompletedAt(toOffset(entity.getCompletedAt()));
        }
        return ride;
    }

    public RideAvailable toRideAvailable(RideEntity entity, String passengerName) {
        RideAvailable ride = new RideAvailable();
        if (entity == null) {
            return ride;
        }
        ride.setId(entity.getId());
        ride.setPassengerName(passengerName);
        ride.setPickupLocation(toLocation(entity.getPickupLat(), entity.getPickupLng(), entity.getPickupAddress()));
        ride.setDropoffLocation(toLocation(entity.getDropoffLat(), entity.getDropoffLng(), entity.getDropoffAddress()));
        ride.setStatus(entity.getStatus());
        ride.setPrice(entity.getEstimatedPrice());
        ride.setDistance(entity.getDistance());
        if (entity.getEstimatedTime() != null) {
            ride.setEstimatedTime(entity.getEstimatedTime());
        }
        return ride;
    }

    private Location toLocation(Double lat, Double lng, String address) {
        Location location = new Location();
        location.setLat(lat);
        location.setLng(lng);
        return location;
    }

    private OffsetDateTime toOffset(java.time.LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.atOffset(ZoneOffset.UTC);
    }
}

