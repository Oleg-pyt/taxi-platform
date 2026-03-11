package com.benatti.backend.websocket;

import com.benatti.backend.entity.RideEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.UserRepository;
import com.benatti.taxiapp.model.Coordinates;
import com.benatti.taxiapp.model.DriverRideRequestWsEvent;
import com.benatti.taxiapp.model.DriverRideRequestWsEventData;
import com.benatti.taxiapp.model.Location;
import com.benatti.taxiapp.model.RideUpdateWsEvent;
import com.benatti.taxiapp.model.RideUpdateWsEventData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RideRealtimePublisher {
    private final RideWebSocketSessionRegistry sessionRegistry;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final Map<UUID, Coordinates> driverLocations = new ConcurrentHashMap<>();

    public RideRealtimePublisher(
            RideWebSocketSessionRegistry sessionRegistry,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.sessionRegistry = sessionRegistry;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public void publishDriverRideRequest(RideEntity ride) {
        DriverRideRequestWsEvent event = new DriverRideRequestWsEvent();
        event.setType(DriverRideRequestWsEvent.TypeEnum.DRIVER_RIDE_REQUEST);

        DriverRideRequestWsEventData data = new DriverRideRequestWsEventData();
        data.setRideId(ride.getId());
        data.setPickupLocation(toLocation(ride.getPickupLat(), ride.getPickupLng(), ride.getPickupAddress()));
        data.setDropoffLocation(toLocation(ride.getDropoffLat(), ride.getDropoffLng(), ride.getDropoffAddress()));
        data.setPassengerName(getUserName(ride.getRiderId()));
        data.setPrice(ride.getEstimatedPrice());
        data.setDistance(ride.getDistance());
        event.setData(data);

        sessionRegistry.getDriverUserIds()
                .forEach(driverId -> sendToUser(driverId, event));
    }

    public void publishRideUpdate(RideEntity ride, String message) {
        RideUpdateWsEvent event = new RideUpdateWsEvent();
        event.setType(RideUpdateWsEvent.TypeEnum.RIDE_UPDATE);

        RideUpdateWsEventData data = new RideUpdateWsEventData();
        data.setRideId(ride.getId());
        data.setStatus(ride.getStatus());
        if (ride.getDriverId() != null) {
            data.setDriverId(JsonNullable.of(ride.getDriverId()));
            data.setDriverName(JsonNullable.of(getUserName(ride.getDriverId())));
            UserEntity driver = userRepository.findById(ride.getDriverId()).orElse(null);
            if (driver != null && driver.getPhone() != null) {
                data.setDriverPhone(JsonNullable.of(driver.getPhone()));
            }
            Coordinates location = driverLocations.get(ride.getDriverId());
            if (location != null) {
                data.setDriverLocation(location);
            }
        }
        if (message != null) {
            data.setMessage(JsonNullable.of(message));
        }
        event.setData(data);

        sendToUser(ride.getRiderId(), event);
        if (ride.getDriverId() != null) {
            sendToUser(ride.getDriverId(), event);
        }
    }

    public void updateDriverLocation(UUID driverId, Coordinates coordinates, UUID ridePassengerId) {
        driverLocations.put(driverId, coordinates);
        if (ridePassengerId != null) {
            RideUpdateWsEvent event = new RideUpdateWsEvent();
            event.setType(RideUpdateWsEvent.TypeEnum.RIDE_UPDATE);
            RideUpdateWsEventData data = new RideUpdateWsEventData();
            data.setDriverId(JsonNullable.of(driverId));
            data.setDriverLocation(coordinates);
            event.setData(data);
            sendToUser(ridePassengerId, event);
        }
    }

    private String getUserName(UUID userId) {
        return userRepository.findById(userId)
                .map(UserEntity::getName)
                .orElse("Unknown");
    }

    private Location toLocation(Double lat, Double lng, String address) {
        Location location = new Location();
        location.setLat(lat);
        location.setLng(lng);
        location.setAddress(address);
        return location;
    }

    private void sendToUser(UUID userId, Object payload) {
        String json = toJson(payload);
        if (json == null) {
            return;
        }
        for (WebSocketSession session : sessionRegistry.getUserSessions(userId)) {
            if (!session.isOpen()) {
                continue;
            }
            try {
                synchronized (session) {
                    session.sendMessage(new TextMessage(json));
                }
            } catch (IOException ignored) {
                // Ignore individual delivery failures.
            }
        }
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}

