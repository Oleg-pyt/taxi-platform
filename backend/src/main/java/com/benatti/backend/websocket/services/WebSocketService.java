package com.benatti.backend.websocket.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

@Log4j2
@Service
public class WebSocketService {
    private final ObjectMapper objectMapper;

    public WebSocketService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public <T> void sendUpdateToUser(WebSocketSession session, T data) throws IOException {
        String json = objectMapper.writeValueAsString(data);
        session.sendMessage(new TextMessage(json));
    }
}
