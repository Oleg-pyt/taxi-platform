package com.benatti.backend.security;

import com.benatti.backend.security.service.CustomUserDetailsService;
import com.benatti.backend.security.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // WebSocket upgrade requests to /rides are authenticated inside RidesWebSocketHandler.
        String upgradeHeader = request.getHeader("Upgrade");
        String requestUri = request.getRequestURI();
        return "websocket".equalsIgnoreCase(upgradeHeader)
                && requestUri != null
                && requestUri.endsWith("/ws");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        UUID userId = jwtService.extractUserId(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userId.toString());
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Browsers cannot attach Authorization headers to native WebSocket handshakes.
        // For upgrade requests, use the token query parameter.
        String upgradeHeader = request.getHeader("Upgrade");
        boolean isWebSocketHandshake = upgradeHeader != null && "websocket".equalsIgnoreCase(upgradeHeader);
        if (isWebSocketHandshake) {
            String tokenFromQuery = request.getParameter("token");
            if (tokenFromQuery != null && !tokenFromQuery.isBlank()) {
                return tokenFromQuery;
            }
        }

        return null;
    }
}
