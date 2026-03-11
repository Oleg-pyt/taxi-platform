package com.benatti.backend.config;

import com.benatti.backend.websocket.RidesWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final RidesWebSocketHandler ridesWebSocketHandler;

    public WebSocketConfig(RidesWebSocketHandler ridesWebSocketHandler) {
        this.ridesWebSocketHandler = ridesWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(ridesWebSocketHandler, "/rides")
                .setAllowedOriginPatterns("*");
    }
}

