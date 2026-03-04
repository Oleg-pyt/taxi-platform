package com.benatti.backend.repository;

import com.benatti.backend.entity.RideEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RideRepository extends JpaRepository<RideEntity, Long> {}
