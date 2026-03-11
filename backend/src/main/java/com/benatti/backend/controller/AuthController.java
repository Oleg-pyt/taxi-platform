package com.benatti.backend.controller;

import com.benatti.backend.assembler.AuthDTOAssembler;
import com.benatti.backend.entity.DriverApplicationEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.security.service.JwtService;
import com.benatti.backend.service.IAuthService;
import com.benatti.backend.service.UserService;
import com.benatti.taxiapp.api.UsersApi;
import com.benatti.taxiapp.model.AuthResponse;
import com.benatti.taxiapp.model.ChangePasswordRequest;
import com.benatti.taxiapp.model.DriverApplicationRequest;
import com.benatti.taxiapp.model.DriverApplicationSubmitResponse;
import com.benatti.taxiapp.model.MessageResponse;
import com.benatti.taxiapp.model.UserLoginRequest;
import com.benatti.taxiapp.model.UserProfile;
import com.benatti.taxiapp.model.UserRegistrationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.UUID;

@RestController
public class AuthController implements UsersApi {
    private final IAuthService authService;
    private final UserService userService;
    private final AuthDTOAssembler authDTOAssembler;
    private final JwtService jwtService;

    public AuthController(
            IAuthService authService,
            UserService userService,
            AuthDTOAssembler authDTOAssembler,
            JwtService jwtService
    ) {
        this.authService = authService;
        this.userService = userService;
        this.authDTOAssembler = authDTOAssembler;
        this.jwtService = jwtService;
    }

    @Override
    public ResponseEntity<AuthResponse> registerUser(@Valid UserRegistrationRequest userRegistrationRequest) {
        AuthResponse response = authService.registerUser(userRegistrationRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<AuthResponse> loginUser(@Valid UserLoginRequest request) {
        AuthResponse response = authService.loginUser(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<UserProfile> getCurrentUser() {
        UserEntity user = userService.getById(getCurrentUserId());
        return ResponseEntity.ok(authDTOAssembler.toUserProfile(user));
    }

    @Override
    public ResponseEntity<MessageResponse> changePassword(@Valid ChangePasswordRequest changePasswordRequest) {
        userService.changePassword(getCurrentUserId(), changePasswordRequest);
        return ResponseEntity.ok(new MessageResponse().message("Password changed successfully"));
    }

    @Override
    public ResponseEntity<DriverApplicationSubmitResponse> applyDriver(@Valid DriverApplicationRequest driverApplicationRequest) {
        DriverApplicationEntity application = userService.applyDriver(getCurrentUserId(), driverApplicationRequest);
        DriverApplicationSubmitResponse response = new DriverApplicationSubmitResponse();
        response.setMessage("Application submitted successfully");
        response.setApplicationId(application.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/refresh-token")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid token"));
        }
        UUID userId = jwtService.extractUserId(token);
        UserEntity user = userService.getById(userId);
        String newToken = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of("token", newToken));
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }
}
