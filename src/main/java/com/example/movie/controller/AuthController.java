package com.example.movie.controller;

import com.example.movie.dto.*;
import com.example.movie.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        AuthResponse resp = authService.register(req);
        if (!resp.isSuccess()) {
            return ResponseEntity.badRequest().body(resp);
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login-step1")
    public ResponseEntity<AuthResponse> loginStep1(@RequestBody LoginStep1Request req) {
        AuthResponse resp = authService.loginStep1(req);
        if (!resp.isSuccess()) {
            return ResponseEntity.badRequest().body(resp);
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login-biometric")
    public ResponseEntity<AuthResponse> verifyBiometricLogin(@RequestBody BiometricLoginRequest req) {
        AuthResponse resp = authService.verifyBiometricLogin(req);
        if (!resp.isSuccess()) {
            return ResponseEntity.badRequest().body(resp);
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> getProfile(@RequestParam Long userId) {
        AuthResponse resp = authService.getProfile(userId);
        if (!resp.isSuccess()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody PreferenceRequest req) {
        authService.updatePreferences(req);
        return ResponseEntity.ok(Map.of("message", "Preferences updated successfully"));
    }

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(@RequestParam Long userId) {
        String genres = authService.getUserPreferences(userId);
        return ResponseEntity.ok(Map.of("genres", genres));
    }
}
