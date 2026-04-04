package com.benatti.backend.assembler;

import com.benatti.backend.entity.UserEntity;
import com.benatti.api.model.AdminUser;
import com.benatti.api.model.UserProfile;
import com.benatti.api.model.UserRole;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuthDTOAssembler {
    public UserProfile toUserProfile(UserEntity userEntity) {
        UserProfile profile = new UserProfile();
        if (userEntity == null) {
            return profile;
        }
        profile.setId(userEntity.getId());
        profile.setEmail(userEntity.getEmail());
        profile.setName(userEntity.getName());
        boolean isDriver = userEntity.getRoles().contains(UserRole.DRIVER);
        profile.setIsDriver(isDriver);
        profile.setDriverApproved(isDriver);
        profile.setRoles(new ArrayList<>(userEntity.getRoles()));
        if (userEntity.getPhone() != null) {
            profile.setPhone(userEntity.getPhone());
        }
        if (userEntity.getProfilePhoto() != null) {
            profile.setProfilePhoto(URI.create(userEntity.getProfilePhoto()));
        }
        return profile;
    }

    public AdminUser toAdminUser(UserEntity userEntity) {
        AdminUser adminUser = new AdminUser();
        if (userEntity == null) {
            return adminUser;
        }
        adminUser.setId(userEntity.getId());
        adminUser.setEmail(userEntity.getEmail());
        adminUser.setName(userEntity.getName());
        adminUser.setIsDriver(userEntity.getRoles().contains(UserRole.DRIVER));
        List<UserRole> roles = new ArrayList<>(userEntity.getRoles());
        adminUser.setRoles(roles);
        if (userEntity.getPhone() != null) {
            adminUser.setPhone(userEntity.getPhone());
        }
        return adminUser;
    }
}
