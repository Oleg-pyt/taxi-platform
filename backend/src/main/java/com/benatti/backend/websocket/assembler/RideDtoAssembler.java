package com.benatti.backend.websocket.assembler;

import com.benatti.api.model.Location;
import com.benatti.api.model.Ride;
import com.benatti.backend.entity.RideEntity;

public class RideDtoAssembler extends AbstractAssembler<RideEntity, Ride> {
    @Override
    public Ride assembleDto(RideEntity entity) {
        Ride ride = null;
        if (entity != null) {
            ride = new Ride();
            ride.setId(entity.getId());
            ride.setDriverId(entity.getDriverId());
            ride.setPickupLocation(assembleLocation(entity.getPickupLat(), entity.getPickupLng()));
            ride.setDropoffLocation(assembleLocation(entity.getDropoffLat(), entity.getDropoffLng()));
            ride.setStatus(entity.getStatus());
        }
        return ride;
    }

    private Location assembleLocation(Double lat, Double lng) {
        Location location = null;
        if (lat != null && lng != null) {
            location = new Location();
            location.setLat(lat);
            location.setLng(lng);
        }
        return location;
    }
}
