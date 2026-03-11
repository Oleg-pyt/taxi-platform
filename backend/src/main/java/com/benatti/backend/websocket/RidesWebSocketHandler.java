package com.benatti.backend.websocket;

import com.benatti.backend.entity.RideEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.UserRepository;
import com.benatti.backend.security.service.JwtService;
import com.benatti.backend.service.RideService;
import com.benatti.taxiapp.model.AcceptRideWsCommand;
import com.benatti.taxiapp.model.CancelRideWsCommand;
import com.benatti.taxiapp.model.Coordinates;
import com.benatti.taxiapp.model.UpdateLocationWsCommand;
import com.benatti.taxiapp.model.UserRole;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class RidesWebSocketHandler extends TextWebSocketHandler {
    private static final String USER_ID_ATTR = "userId";

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RideService rideService;
    private final RideWebSocketSessionRegistry sessionRegistry;
    private final RideRealtimePublisher realtimePublisher;
    private final ObjectMapper objectMapper;

    public RidesWebSocketHandler(
            JwtService jwtService,
            UserRepository userRepository,
            RideService rideService,
            RideWebSocketSessionRegistry sessionRegistry,
            RideRealtimePublisher realtimePublisher,
            ObjectMapper objectMapper
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.rideService = rideService;
        this.sessionRegistry = sessionRegistry;
        this.realtimePublisher = realtimePublisher;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        UUID userId = extractUserId(session.getUri());
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Set<UserRole> roles = user.getRoles();

        session.getAttributes().put(USER_ID_ATTR, userId);
        sessionRegistry.register(userId, roles, session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        UUID userId = (UUID) session.getAttributes().get(USER_ID_ATTR);
        if (userId == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            return;
        }

        JsonNode root = objectMapper.readTree(message.getPayload());
        String type = root.path("type").asText();

        switch (type) {
            case "ACCEPT_RIDE" -> {
                rideService.ensureDriverRole(userId);
                AcceptRideWsCommand command = objectMapper.treeToValue(root, AcceptRideWsCommand.class);
                rideService.acceptRide(command.getData().getRideId(), userId);
            }
            case "REJECT_RIDE" -> {
                // No persistent state update is required for reject in current domain model.
            }
            case "UPDATE_LOCATION" -> {
                rideService.ensureDriverRole(userId);
                UpdateLocationWsCommand command = objectMapper.treeToValue(root, UpdateLocationWsCommand.class);
                Coordinates location = command.getData().getLocation();
                RideEntity activeRide = rideService.getActiveRide(userId);
                UUID passengerId = activeRide != null && userId.equals(activeRide.getDriverId())
                        ? activeRide.getRiderId()
                        : null;
                realtimePublisher.updateDriverLocation(userId, location, passengerId);
            }
            case "CANCEL_RIDE" -> {
                CancelRideWsCommand command = objectMapper.treeToValue(root, CancelRideWsCommand.class);
                rideService.cancelRide(command.getData().getRideId(), userId);
            }
            default -> session.sendMessage(new TextMessage("{\"message\":\"Unsupported command\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionRegistry.unregister(session);
    }

    private UUID extractUserId(URI uri) {
        if (uri == null || uri.getQuery() == null) {
            throw new IllegalArgumentException("Token is required");
        }
        Map<String, String> queryParams = Arrays.stream(uri.getQuery().split("&"))
                .map(param -> param.split("=", 2))
                .filter(parts -> parts.length == 2)
                .collect(Collectors.toMap(parts -> parts[0], parts -> parts[1], (left, right) -> right));
        String token = queryParams.get("token");
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token is required");
        }
        return jwtService.extractUserId(token);
    }
}

