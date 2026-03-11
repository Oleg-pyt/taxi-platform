package com.benatti.backend.service;

import com.benatti.backend.entity.DriverApplicationEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.DriverApplicationRepository;
import com.benatti.backend.repository.UserRepository;
import com.benatti.taxiapp.model.ChangePasswordRequest;
import com.benatti.taxiapp.model.DriverApplicationRequest;
import com.benatti.taxiapp.model.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final DriverApplicationRepository driverApplicationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            DriverApplicationRepository driverApplicationRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.driverApplicationRepository = driverApplicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity getById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        UserEntity user = getById(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid current password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public DriverApplicationEntity applyDriver(UUID userId, DriverApplicationRequest request) {
        UserEntity user = getById(userId);
        if (user.getRoles().contains(UserRole.DRIVER)) {
            throw new IllegalArgumentException("User already has driver role");
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }
        DriverApplicationEntity entity = new DriverApplicationEntity();
        entity.setUserId(userId);
        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setPhone(request.getPhone());
        entity.setLicenseNumber(request.getLicenseNumber());
        entity.setCarModel(request.getCarModel());
        entity.setCarYear(request.getCarYear());
        entity.setCarPlate(request.getCarPlate());
        entity.setCarColor(request.getCarColor());
        return driverApplicationRepository.save(entity);
    }

    public UserEntity blockUser(UUID userId) {
        UserEntity user = getById(userId);
        user.setActive(false);
        return userRepository.save(user);
    }
}
