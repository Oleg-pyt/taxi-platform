package com.benatti.backend.config;

import com.benatti.backend.security.service.JwtService;
import com.benatti.backend.websocket.RidesWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final RidesWebSocketHandler ridesWebSocketHandler;
    private final JwtService jwtService;

    public WebSocketConfig(RidesWebSocketHandler ridesWebSocketHandler, JwtService jwtService) {
        this.ridesWebSocketHandler = ridesWebSocketHandler;
        this.jwtService = jwtService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(ridesWebSocketHandler, "/ws")
                .addInterceptors(new AuthHandshakeInterceptor(jwtService))
                .setAllowedOriginPatterns("*");
    }
}

