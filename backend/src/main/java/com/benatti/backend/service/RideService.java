package com.benatti.backend.service;

import com.benatti.backend.entity.RideEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.RideRepository;
import com.benatti.backend.repository.UserRepository;
import com.benatti.backend.websocket.RideRealtimePublisher;
import com.benatti.taxiapp.model.RideCreateRequest;
import com.benatti.taxiapp.model.RideStatus;
import com.benatti.taxiapp.model.UserRole;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RideService {
    private static final List<RideStatus> ACTIVE_STATUSES = List.of(
            RideStatus.CREATED,
            RideStatus.OFFERED,
            RideStatus.ACCEPTED,
            RideStatus.IN_PROGRESS
    );

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final RideRealtimePublisher realtimePublisher;

    public RideService(
            RideRepository rideRepository,
            UserRepository userRepository,
            RideRealtimePublisher realtimePublisher
    ) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.realtimePublisher = realtimePublisher;
    }

    public RideEntity createRide(UUID riderId, RideCreateRequest request) {
        RideEntity ride = new RideEntity(riderId,
                request.getPickupLocation().getLat(),
                request.getPickupLocation().getLng(),
                request.getDropoffLocation().getLat(),
                request.getDropoffLocation().getLng());
        ride.setPickupAddress(request.getPickupLocation().getAddress());
        ride.setDropoffAddress(request.getDropoffLocation().getAddress());
        ride.setEstimatedPrice(request.getPrice());
        ride.setDistance(request.getDistance());
        ride.setEstimatedTime(request.getEstimatedTime());
        RideEntity saved = rideRepository.save(ride);
        realtimePublisher.publishDriverRideRequest(saved);
        return saved;
    }

    public RideEntity getActiveRide(UUID userId) {
        return rideRepository.findFirstByRiderIdAndStatusInOrderByCreatedAtDesc(userId, ACTIVE_STATUSES)
                .or(() -> rideRepository.findFirstByDriverIdAndStatusInOrderByCreatedAtDesc(userId, ACTIVE_STATUSES))
                .orElse(null);
    }

    public List<RideEntity> getRideHistory(UUID userId) {
        return rideRepository.findByRiderIdOrDriverIdOrderByCreatedAtDesc(userId, userId);
    }

    public List<RideEntity> getAvailableRides() {
        return rideRepository.findByStatus(RideStatus.CREATED);
    }

    public RideEntity acceptRide(UUID rideId, UUID driverId) {
        RideEntity ride = getRide(rideId);
        if (ride.getStatus() != RideStatus.CREATED && ride.getStatus() != RideStatus.OFFERED) {
            throw new IllegalArgumentException("Ride is not available");
        }
        ride.setDriverId(driverId);
        ride.setStatus(RideStatus.ACCEPTED);
        ride.setAssignedAt(LocalDateTime.now());
        RideEntity saved = rideRepository.save(ride);
        realtimePublisher.publishRideUpdate(saved, "Driver accepted the ride");
        return saved;
    }

    public RideEntity completeRide(UUID rideId, UUID driverId) {
        RideEntity ride = getRide(rideId);
        if (!driverId.equals(ride.getDriverId())) {
            throw new IllegalArgumentException("Driver mismatch");
        }
        ride.setStatus(RideStatus.COMPLETED);
        ride.setCompletedAt(LocalDateTime.now());
        RideEntity saved = rideRepository.save(ride);
        realtimePublisher.publishRideUpdate(saved, "Ride completed");
        return saved;
    }

    public RideEntity updateRideStatus(UUID rideId, UUID userId, RideStatus newStatus) {
        RideEntity ride = getRide(rideId);
        boolean isPassenger = userId.equals(ride.getRiderId());
        boolean isDriver = userId.equals(ride.getDriverId());

        if (!isPassenger && !isDriver) {
            throw new IllegalArgumentException("Not allowed");
        }

        if (newStatus == RideStatus.CANCELLED) {
            return cancelRide(rideId, userId);
        }

        if (!isDriver) {
            throw new IllegalArgumentException("Only driver can update this status");
        }

        switch (newStatus) {
            case ACCEPTED -> {
                if (ride.getStatus() == RideStatus.CREATED || ride.getStatus() == RideStatus.OFFERED) {
                    return acceptRide(rideId, userId);
                }
                throw new IllegalArgumentException("Invalid status transition");
            }
            case IN_PROGRESS -> {
                if (ride.getStatus() != RideStatus.ACCEPTED) {
                    throw new IllegalArgumentException("Invalid status transition");
                }
                ride.setStatus(RideStatus.IN_PROGRESS);
                RideEntity saved = rideRepository.save(ride);
                realtimePublisher.publishRideUpdate(saved, "Ride in progress");
                return saved;
            }
            case COMPLETED -> {
                return completeRide(rideId, userId);
            }
            default -> throw new IllegalArgumentException("Unsupported target status");
        }
    }

    public PriceEstimation estimatePrice(
            double pickupLat,
            double pickupLng,
            double dropoffLat,
            double dropoffLng
    ) {
        double kmPerDegree = 111.0;
        double latDiff = dropoffLat - pickupLat;
        double lngDiff = dropoffLng - pickupLng;
        double distanceKm = Math.sqrt((latDiff * latDiff) + (lngDiff * lngDiff)) * kmPerDegree;

        double baseFare = 60.0;
        double perKm = 16.0;
        double price = Math.max(baseFare, baseFare + (distanceKm * perKm));
        int durationMinutes = (int) Math.max(5, Math.round((distanceKm / 28.0) * 60.0));

        return new PriceEstimation(distanceKm, durationMinutes, price, "UAH");
    }

    public static class PriceEstimation {
        private final double distance;
        private final int duration;
        private final double price;
        private final String currency;

        public PriceEstimation(double distance, int duration, double price, String currency) {
            this.distance = distance;
            this.duration = duration;
            this.price = price;
            this.currency = currency;
        }

        public double getDistance() {
            return distance;
        }

        public int getDuration() {
            return duration;
        }

        public double getPrice() {
            return price;
        }

        public String getCurrency() {
            return currency;
        }
    }

    public RideEntity cancelRide(UUID rideId, UUID userId) {
        RideEntity ride = getRide(rideId);
        if (!userId.equals(ride.getRiderId()) && !userId.equals(ride.getDriverId())) {
            throw new IllegalArgumentException("Not allowed");
        }
        ride.setStatus(RideStatus.CANCELLED);
        RideEntity saved = rideRepository.save(ride);
        realtimePublisher.publishRideUpdate(saved, "Ride cancelled");
        return saved;
    }

    public void ensureDriverRole(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!user.getRoles().contains(UserRole.DRIVER)) {
            throw new IllegalArgumentException("Driver role required");
        }
    }

    public RideEntity getRide(UUID rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));
    }
}
