package com.benatti.backend.service.impl;

import com.benatti.backend.assembler.AuthDTOAssembler;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.UserRepository;
import com.benatti.backend.service.IAuthService;
import com.benatti.backend.security.service.JwtService;
import com.benatti.taxiapp.model.AuthResponse;
import com.benatti.taxiapp.model.UserLoginRequest;
import com.benatti.taxiapp.model.UserRegistrationRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService implements IAuthService {
    private final UserRepository userRepository;
    private final AuthDTOAssembler authDTOAssembler;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            AuthDTOAssembler authDTOAssembler,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.authDTOAssembler = authDTOAssembler;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse registerUser(UserRegistrationRequest userRegistrationRequest) {
        Optional<UserEntity> userByEmail = userRepository.findByEmail(userRegistrationRequest.getEmail());
        if (userByEmail.isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        UserEntity userEntity = userRepository.save(
                new UserEntity(
                        userRegistrationRequest.getUsername(),
                        userRegistrationRequest.getEmail(),
                        passwordEncoder.encode(userRegistrationRequest.getPassword())
                )
        );
        String token = jwtService.generateToken(userEntity);
        return new AuthResponse(token, authDTOAssembler.toUserProfile(userEntity));
    }

    @Override
    public AuthResponse loginUser(UserLoginRequest userLoginRequest) {
        UserEntity userEntity = getByEmail(userLoginRequest.getEmail());
        if (!passwordEncoder.matches(userLoginRequest.getPassword(), userEntity.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwtService.generateToken(userEntity);
        return new AuthResponse(token, authDTOAssembler.toUserProfile(userEntity));
    }

    @Override
    public UserEntity getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
