package com.benatti.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class PaymentEntity {
    public enum Status {
        PENDING,
        COMPLETED,
        FAILED,
        REFUNDED
    }

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "ride_id", nullable = false)
    private UUID rideId;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PaymentEntity(UUID rideId, Double amount) {
        this.rideId = rideId;
        this.amount = amount;
        this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public PaymentEntity() {
    }
}
