package com.benatti.backend.service;

import com.benatti.backend.entity.UserEntity;
import com.benatti.taxiapp.model.AuthResponse;
import com.benatti.taxiapp.model.UserLoginRequest;
import com.benatti.taxiapp.model.UserRegistrationRequest;

public interface IAuthService {
    AuthResponse registerUser(UserRegistrationRequest userRegistrationRequest);

    AuthResponse loginUser(UserLoginRequest userLoginRequest);

    UserEntity getByEmail(String email);
}
