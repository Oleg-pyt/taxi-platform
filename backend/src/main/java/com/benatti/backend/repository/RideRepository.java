package com.benatti.backend.repository;

import com.benatti.backend.entity.RideEntity;
import com.benatti.taxiapp.model.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideRepository extends JpaRepository<RideEntity, UUID> {
    Optional<RideEntity> findFirstByRiderIdAndStatusInOrderByCreatedAtDesc(UUID riderId, List<RideStatus> statuses);

    Optional<RideEntity> findFirstByDriverIdAndStatusInOrderByCreatedAtDesc(UUID driverId, List<RideStatus> statuses);

    List<RideEntity> findByRiderIdOrDriverIdOrderByCreatedAtDesc(UUID riderId, UUID driverId);

    List<RideEntity> findByStatus(RideStatus status);

    List<RideEntity> findByStatusIn(List<RideStatus> statuses);
}
