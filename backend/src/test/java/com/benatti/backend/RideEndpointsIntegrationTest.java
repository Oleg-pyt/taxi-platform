package com.benatti.backend;

import com.benatti.backend.entity.RideEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.RideRepository;
import com.benatti.backend.repository.UserRepository;
import com.benatti.backend.security.service.JwtService;
import com.benatti.taxiapp.model.RideStatus;
import com.benatti.taxiapp.model.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class RideEndpointsIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        rideRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void calculatePriceReturnsDistanceDurationAndPrice() throws Exception {
        Map<String, Object> payload = Map.of(
                "pickupLocation", Map.of("lat", 50.4501, "lng", 30.5234),
                "dropoffLocation", Map.of("lat", 50.4547, "lng", 30.5238)
        );

        mockMvc.perform(post("/rides/calculate-price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distance").isNumber())
                .andExpect(jsonPath("$.duration").isNumber())
                .andExpect(jsonPath("$.price").isNumber())
                .andExpect(jsonPath("$.currency").value("UAH"));
    }

    @Test
    void getRideByIdReturnsRideForAuthenticatedParticipant() throws Exception {
        UserEntity rider = createUser("Rider", "rider@test.dev", UserRole.PASSENGER);
        RideEntity ride = new RideEntity(rider.getId(), 50.45, 30.52, 50.47, 30.54);
        ride.setPickupAddress("Pickup");
        ride.setDropoffAddress("Dropoff");
        ride.setEstimatedPrice(120.0);
        ride.setDistance(7.5);
        ride.setEstimatedTime(18);
        ride = rideRepository.save(ride);

        String token = jwtService.generateToken(rider);

        mockMvc.perform(get("/rides/{rideId}", ride.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ride.getId().toString()))
                .andExpect(jsonPath("$.passengerId").value(rider.getId().toString()))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    void patchRideStatusUpdatesStatusForAssignedDriver() throws Exception {
        UserEntity rider = createUser("Rider", "rider2@test.dev", UserRole.PASSENGER);
        UserEntity driver = createUser("Driver", "driver@test.dev", UserRole.DRIVER);

        RideEntity ride = new RideEntity(rider.getId(), 50.45, 30.52, 50.47, 30.54);
        ride.setDriverId(driver.getId());
        ride.setStatus(RideStatus.ACCEPTED);
        ride = rideRepository.save(ride);

        String token = jwtService.generateToken(driver);
        String payload = objectMapper.writeValueAsString(Map.of("status", "IN_PROGRESS"));

        mockMvc.perform(patch("/rides/{rideId}/status", ride.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ride.getId().toString()))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    private UserEntity createUser(String name, String email, UserRole role) {
        UserEntity user = new UserEntity(name, email, "encoded-password");
        user.getRoles().clear();
        user.getRoles().add(role);
        return userRepository.save(user);
    }
}
