package com.benatti.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

import com.benatti.taxiapp.model.RideStatus;

@Entity
@Table(name = "rides")
@Getter
@Setter
public class RideEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Relations (can be ManyToOne if you want proper FK)
    @Column(name = "rider_id", nullable = false)
    private UUID riderId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;

    @Column(name = "pickup_lat", nullable = false)
    private Double pickupLat;

    @Column(name = "pickup_lng", nullable = false)
    private Double pickupLng;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "dropoff_lat")
    private Double dropoffLat;

    @Column(name = "dropoff_lng")
    private Double dropoffLng;

    @Column(name = "dropoff_address")
    private String dropoffAddress;

    @Column(name = "estimated_price")
    private Double estimatedPrice;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "estimated_time")
    private Integer estimatedTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Version
    private Long version; // optimistic locking

    public RideEntity(UUID riderId, Double pickupLat, Double pickupLng, Double dropoffLat, Double dropoffLng) {
        this.riderId = riderId;
        this.status = RideStatus.CREATED;
        this.pickupLat = pickupLat;
        this.pickupLng = pickupLng;
        this.dropoffLat = dropoffLat;
        this.dropoffLng = dropoffLng;
        this.createdAt = LocalDateTime.now();
    }

    public RideEntity() {
    }
}
