package com.benatti.backend.config;

import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.UserRepository;
import com.benatti.taxiapp.model.UserRole;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DefaultAdminInitializer {

    @Bean
    public ApplicationRunner seedDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> userRepository.findByEmail("admin@gmail.com").orElseGet(() -> {
            UserEntity admin = new UserEntity("admin", "admin@gmail.com", passwordEncoder.encode("123456"));
            admin.getRoles().clear();
            Set<UserRole> roles = admin.getRoles();
            roles.add(UserRole.ADMIN);
            roles.add(UserRole.DRIVER);
            roles.add(UserRole.PASSENGER);
            admin.setActive(true);
            admin.setIsDriver(true);
            return userRepository.save(admin);
        });
    }
}

