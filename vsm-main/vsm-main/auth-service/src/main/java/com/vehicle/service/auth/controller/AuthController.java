package com.vehicle.service.auth.controller;

import com.vehicle.service.auth.dto.AuthRequest;
import com.vehicle.service.auth.dto.AuthResponse;
import com.vehicle.service.auth.dto.RegisterRequest;
import com.vehicle.service.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            com.vehicle.service.auth.entity.User user = new com.vehicle.service.auth.entity.User();
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());
            user.setEmail(request.getEmail());
            user.setRole(request.getRole());
            
            authService.register(user);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.DisabledException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body("Your account is pending admin approval.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(authService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable com.vehicle.service.auth.entity.Role role) {
        try {
            return ResponseEntity.ok(authService.getUsersByRole(role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/pending")
    public ResponseEntity<?> getPendingUsers() {
        try {
            return ResponseEntity.ok(authService.getPendingUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            authService.approveUser(id);
            return ResponseEntity.ok("User approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        try {
            authService.rejectUser(id);
            return ResponseEntity.ok("User rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
