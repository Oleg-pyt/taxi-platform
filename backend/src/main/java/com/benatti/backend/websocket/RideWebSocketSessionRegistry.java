package com.benatti.backend.websocket;

import com.benatti.taxiapp.model.UserRole;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RideWebSocketSessionRegistry {
    private final Map<UUID, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final Map<String, UUID> sessionToUser = new ConcurrentHashMap<>();
    private final Map<UUID, Set<UserRole>> userRoles = new ConcurrentHashMap<>();

    public void register(UUID userId, Set<UserRole> roles, WebSocketSession session) {
        userSessions.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet()).add(session);
        sessionToUser.put(session.getId(), userId);
        userRoles.put(userId, roles);
    }

    public void unregister(WebSocketSession session) {
        UUID userId = sessionToUser.remove(session.getId());
        if (userId == null) {
            return;
        }
        Set<WebSocketSession> sessions = userSessions.getOrDefault(userId, Collections.emptySet());
        sessions.remove(session);
        if (sessions.isEmpty()) {
            userSessions.remove(userId);
            userRoles.remove(userId);
        }
    }

    public Set<WebSocketSession> getUserSessions(UUID userId) {
        return userSessions.getOrDefault(userId, Collections.emptySet());
    }

    public Set<UUID> getDriverUserIds() {
        return userRoles.entrySet().stream()
                .filter(entry -> entry.getValue().contains(UserRole.DRIVER))
                .map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toSet());
    }
}

