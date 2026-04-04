package com.benatti.backend.service;

import com.benatti.backend.entity.UserEntity;
import com.benatti.api.model.AuthResponse;
import com.benatti.api.model.UserLoginRequest;
import com.benatti.api.model.UserRegistrationRequest;

public interface IAuthService {
    AuthResponse registerUser(UserRegistrationRequest userRegistrationRequest);

    AuthResponse loginUser(UserLoginRequest userLoginRequest);

    UserEntity getByEmail(String email);
}
