package com.benatti.backend.repository;

import com.benatti.backend.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {
    @Query("select coalesce(sum(p.amount), 0) from PaymentEntity p where p.status = :status")
    Double sumAmountByStatus(@Param("status") PaymentEntity.Status status);
}
