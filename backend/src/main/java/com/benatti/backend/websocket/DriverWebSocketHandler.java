package com.benatti.backend.websocket;

import com.benatti.api.model.UserRole;
import com.benatti.backend.entity.RideEntity;
import com.benatti.backend.entity.UserEntity;
import com.benatti.backend.repository.UserRepository;
import com.benatti.backend.service.RideService;
import com.benatti.backend.websocket.services.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class DriverWebSocketHandler extends TextWebSocketHandler {
    private static final String USER_ID_ATTR = "userId";
    private static final Logger logger = LoggerFactory.getLogger(RidesWebSocketHandler.class);

    private final UserRepository userRepository;
    private final RideService rideService;
    private final RideWebSocketSessionRegistry sessionRegistry;
    private final WebSocketService webSocketService;

    public DriverWebSocketHandler(
            UserRepository userRepository,
            RideService rideService,
            RideWebSocketSessionRegistry sessionRegistry,
            WebSocketService webSocketService
    ) {
        this.userRepository = userRepository;
        this.rideService = rideService;
        this.sessionRegistry = sessionRegistry;
        this.webSocketService = webSocketService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        try {
            UUID userId = (UUID) session.getAttributes().get(USER_ID_ATTR);
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            Set<UserRole> roles = user.getRoles();
            sessionRegistry.register(userId, roles, session);
            sendUpdateToUser(session, userId);
            logger.info("WebSocket connection established for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to establish WebSocket connection", e);
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason(e.getMessage()));
        }
    }

    private void sendUpdateToUser(WebSocketSession session, UUID userId) throws IOException {
        RideEntity activeRide = rideService.getActiveRideForRider(userId);
        if (activeRide != null) {
            webSocketService.sendUpdateToUser(session, activeRide);
        } else {
            List<RideEntity> availableRides = rideService.getAvailableRides();

        }
    }
}
