package com.benatti.backend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Forwards all unknown (non-API) routes to Angular's index.html
 * so that client-side routing (e.g. /map, /login) works correctly.
 */
@RestController
public class SpaController {

    @GetMapping(
        value = {
            "/map", "/map/**",
            "/login", "/register",
            "/driver/**",
            "/admin/**",
            "/profile/**"
        },
        produces = MediaType.TEXT_HTML_VALUE
    )
    public ResponseEntity<Resource> spa() {
        Resource index = new ClassPathResource("META-INF/resources/browser/index.html");
        if (!index.exists()) {
            // fallback for flat layout (without /browser/)
            index = new ClassPathResource("META-INF/resources/index.html");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(index);
    }
}

