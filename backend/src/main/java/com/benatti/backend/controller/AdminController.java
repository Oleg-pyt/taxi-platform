package com.benatti.backend.controller;

import com.benatti.backend.assembler.AuthDTOAssembler;
import com.benatti.backend.entity.DriverApplicationEntity;
import com.benatti.backend.entity.PaymentEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.DriverApplicationRepository;
import com.benatti.backend.repository.PaymentRepository;
import com.benatti.backend.repository.RideRepository;
import com.benatti.backend.repository.UserRepository;
import com.benatti.backend.service.UserService;
import com.benatti.taxiapp.api.AdminApi;
import com.benatti.taxiapp.model.AdminStats;
import com.benatti.taxiapp.model.AdminUser;
import com.benatti.taxiapp.model.DriverApplication;
import com.benatti.taxiapp.model.MessageResponse;
import com.benatti.taxiapp.model.RideStatus;
import com.benatti.taxiapp.model.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class AdminController implements AdminApi {
    private final DriverApplicationRepository driverApplicationRepository;
    private final UserRepository userRepository;
    private final RideRepository rideRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final AuthDTOAssembler authDTOAssembler;

    public AdminController(
            DriverApplicationRepository driverApplicationRepository,
            UserRepository userRepository,
            RideRepository rideRepository,
            PaymentRepository paymentRepository,
            UserService userService,
            AuthDTOAssembler authDTOAssembler
    ) {
        this.driverApplicationRepository = driverApplicationRepository;
        this.userRepository = userRepository;
        this.rideRepository = rideRepository;
        this.paymentRepository = paymentRepository;
        this.userService = userService;
        this.authDTOAssembler = authDTOAssembler;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DriverApplication>> getDriverApplications() {
        List<DriverApplication> applications = driverApplicationRepository.findAll().stream()
                .map(this::toDriverApplication)
                .collect(Collectors.toList());
        return ResponseEntity.ok(applications);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> approveDriverApplication(UUID applicationId) {
        DriverApplicationEntity application = getApplication(applicationId);
        application.setStatus(DriverApplicationEntity.Status.APPROVED);
        driverApplicationRepository.save(application);

        UserEntity user = userRepository.findById(application.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.getRoles().add(UserRole.DRIVER);
        user.setIsDriver(true);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse().message("Application approved successfully"));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> rejectDriverApplication(UUID applicationId) {
        DriverApplicationEntity application = getApplication(applicationId);
        application.setStatus(DriverApplicationEntity.Status.REJECTED);
        driverApplicationRepository.save(application);
        return ResponseEntity.ok(new MessageResponse().message("Application rejected successfully"));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUser>> getAdminUsers() {
        List<AdminUser> users = userRepository.findAll().stream()
                .map(authDTOAssembler::toAdminUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> blockUser(UUID userId) {
        userService.blockUser(userId);
        return ResponseEntity.ok(new MessageResponse().message("User blocked successfully"));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStats> getAdminStats() {
        long totalRides = rideRepository.count();
        long completedRides = rideRepository.findByStatus(RideStatus.COMPLETED).size();
        long cancelledRides = rideRepository.findByStatus(RideStatus.CANCELLED).size();
        long activeRides = rideRepository.findByStatusIn(List.of(
                RideStatus.CREATED,
                RideStatus.OFFERED,
                RideStatus.ACCEPTED,
                RideStatus.IN_PROGRESS
        )).size();
        Double totalRevenue = paymentRepository.sumAmountByStatus(PaymentEntity.Status.COMPLETED);

        AdminStats stats = new AdminStats();
        stats.setTotalRides((int) totalRides);
        stats.setCompletedRides((int) completedRides);
        stats.setCancelledRides((int) cancelledRides);
        stats.setActiveRides((int) activeRides);
        stats.setTotalRevenue(totalRevenue == null ? 0.0 : totalRevenue);
        return ResponseEntity.ok(stats);
    }

    private DriverApplicationEntity getApplication(UUID applicationId) {
        return driverApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }

    private DriverApplication toDriverApplication(DriverApplicationEntity entity) {
        DriverApplication application = new DriverApplication();
        application.setId(entity.getId());
        application.setUserId(entity.getUserId());
        application.setFirstName(entity.getFirstName());
        application.setLastName(entity.getLastName());
        application.setPhone(entity.getPhone());
        application.setLicenseNumber(entity.getLicenseNumber());
        application.setCarModel(entity.getCarModel());
        application.setCarYear(entity.getCarYear());
        application.setCarPlate(entity.getCarPlate());
        application.setCarColor(entity.getCarColor());
        application.setStatus(DriverApplication.StatusEnum.valueOf(entity.getStatus().name()));
        application.setCreatedAt(OffsetDateTime.of(entity.getCreatedAt(), ZoneOffset.UTC));
        return application;
    }
}

