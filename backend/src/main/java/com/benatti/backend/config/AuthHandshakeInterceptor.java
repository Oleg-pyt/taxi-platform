package com.benatti.backend.config;

import com.benatti.backend.security.service.JwtService;
import com.benatti.backend.websocket.RideWebSocketSessionRegistry;
import io.micrometer.common.util.StringUtils;
import lombok.extern.log4j.Log4j2;
import org.jspecify.annotations.Nullable;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.UUID;

@Log4j2
public class AuthHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtService jwtService;

    public AuthHandshakeInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        String query = request.getURI().getQuery();
        boolean authenticated = false;
        if (StringUtils.isNotBlank(query) && query.contains("token=")) {
            String token = query.split("token=")[1];
            try {
                UUID uuid = jwtService.extractUserId(token);
                attributes.put("userId", uuid);
                authenticated = true;
            } catch (Exception e) {
                log.error("WebSocket handshake failed: invalid token", e);
            }
        }
        return authenticated;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, @Nullable Exception exception) {
        // No post-handshake actions needed
    }
}
