package com.benatti.backend.repository;

import com.benatti.backend.entity.DriverApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DriverApplicationRepository extends JpaRepository<DriverApplicationEntity, UUID> {}

