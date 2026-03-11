package com.benatti.backend.controller;

import com.benatti.backend.assembler.RideDTOAssembler;
import com.benatti.backend.entity.RideEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.service.RideService;
import com.benatti.backend.repository.UserRepository;
import com.benatti.taxiapp.api.RidesApi;
import com.benatti.taxiapp.model.ActiveRideResponse;
import com.benatti.taxiapp.model.MessageResponse;
import com.benatti.taxiapp.model.Ride;
import com.benatti.taxiapp.model.RideAvailable;
import com.benatti.taxiapp.model.RideCreateRequest;
import com.benatti.taxiapp.model.RideStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class RESTRideService implements RidesApi {
    private final RideService rideService;
    private final RideDTOAssembler rideDTOAssembler;
    private final UserRepository userRepository;

    public RESTRideService(RideService rideService, RideDTOAssembler rideDTOAssembler, UserRepository userRepository) {
        this.rideService = rideService;
        this.rideDTOAssembler = rideDTOAssembler;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<Ride> createRide(@Valid RideCreateRequest rideCreateRequest) {
        RideEntity ride = rideService.createRide(getCurrentUserId(), rideCreateRequest);
        String passengerName = getUserName(ride.getRiderId());
        Ride response = rideDTOAssembler.toRide(ride, passengerName, null);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<ActiveRideResponse> getActiveRide() {
        RideEntity ride = rideService.getActiveRide(getCurrentUserId());
        if (ride == null) {
            return ResponseEntity.ok(null);
        }
        String passengerName = getUserName(ride.getRiderId());
        String driverName = ride.getDriverId() == null ? null : getUserName(ride.getDriverId());
        return ResponseEntity.ok(rideDTOAssembler.toActiveRide(ride, passengerName, driverName));
    }

    @Override
    public ResponseEntity<List<Ride>> getRideHistory() {
        List<Ride> rides = rideService.getRideHistory(getCurrentUserId()).stream()
                .map(ride -> rideDTOAssembler.toRide(
                        ride,
                        getUserName(ride.getRiderId()),
                        ride.getDriverId() == null ? null : getUserName(ride.getDriverId())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(rides);
    }

    @Override
    public ResponseEntity<MessageResponse> cancelRide(UUID rideId) {
        rideService.cancelRide(rideId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse().message("Ride cancelled successfully"));
    }

    @Override
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Ride> acceptRide(UUID rideId) {
        UUID driverId = getCurrentUserId();
        rideService.ensureDriverRole(driverId);
        RideEntity ride = rideService.acceptRide(rideId, driverId);
        Ride response = rideDTOAssembler.toRide(
                ride,
                getUserName(ride.getRiderId()),
                getUserName(driverId)
        );
        return ResponseEntity.ok(response);
    }

    @Override
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Ride> completeRide(UUID rideId) {
        UUID driverId = getCurrentUserId();
        rideService.ensureDriverRole(driverId);
        RideEntity ride = rideService.completeRide(rideId, driverId);
        Ride response = rideDTOAssembler.toRide(
                ride,
                getUserName(ride.getRiderId()),
                getUserName(driverId)
        );
        return ResponseEntity.ok(response);
    }

    @Override
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<RideAvailable>> getAvailableRides() {
        List<RideAvailable> rides = rideService.getAvailableRides().stream()
                .map(ride -> rideDTOAssembler.toRideAvailable(ride, getUserName(ride.getRiderId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(rides);
    }

    @Override
    public ResponseEntity<Void> connectRidesWebSocket(String token) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/rides/{rideId}")
    public ResponseEntity<Ride> getRideById(@PathVariable UUID rideId) {
        RideEntity ride = rideService.getRide(rideId);
        String passengerName = getUserName(ride.getRiderId());
        String driverName = ride.getDriverId() == null ? null : getUserName(ride.getDriverId());
        return ResponseEntity.ok(rideDTOAssembler.toRide(ride, passengerName, driverName));
    }

    @PatchMapping("/rides/{rideId}/status")
    public ResponseEntity<Ride> updateRideStatus(
            @PathVariable UUID rideId,
            @RequestBody Map<String, String> payload
    ) {
        String rawStatus = payload.get("status");
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        RideStatus status = RideStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        RideEntity updated = rideService.updateRideStatus(rideId, getCurrentUserId(), status);
        String passengerName = getUserName(updated.getRiderId());
        String driverName = updated.getDriverId() == null ? null : getUserName(updated.getDriverId());
        return ResponseEntity.ok(rideDTOAssembler.toRide(updated, passengerName, driverName));
    }

    @PostMapping("/rides/calculate-price")
    public ResponseEntity<Map<String, Object>> calculatePrice(@RequestBody Map<String, Map<String, Double>> payload) {
        Map<String, Double> pickup = payload.get("pickupLocation");
        Map<String, Double> dropoff = payload.get("dropoffLocation");
        if (pickup == null || dropoff == null) {
            throw new IllegalArgumentException("Pickup and dropoff locations are required");
        }

        RideService.PriceEstimation result = rideService.estimatePrice(
                pickup.getOrDefault("lat", 0.0),
                pickup.getOrDefault("lng", 0.0),
                dropoff.getOrDefault("lat", 0.0),
                dropoff.getOrDefault("lng", 0.0)
        );

        return ResponseEntity.ok(Map.of(
            "distance", result.getDistance(),
            "duration", result.getDuration(),
            "price", result.getPrice(),
            "currency", result.getCurrency()
        ));
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }

    private String getUserName(UUID userId) {
        return userRepository.findById(userId)
                .map(UserEntity::getName)
                .orElse(null);
    }
}
