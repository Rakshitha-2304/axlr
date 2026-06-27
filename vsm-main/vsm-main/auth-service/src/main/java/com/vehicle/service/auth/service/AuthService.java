package com.vehicle.service.auth.service;

import com.vehicle.service.auth.dto.AuthRequest;
import com.vehicle.service.auth.dto.AuthResponse;
import com.vehicle.service.auth.dto.RegisterRequest;
import com.vehicle.service.auth.entity.Role;
import com.vehicle.service.auth.entity.User;
import com.vehicle.service.auth.repository.UserRepository;
import com.vehicle.service.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public User register(User user) {
        if (Role.ADMIN.equals(user.getRole())) {
            throw new IllegalArgumentException("Registration of ADMIN accounts is prohibited.");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Default role to CUSTOMER if not provided
        if (user.getRole() == null) {
            user.setRole(Role.CUSTOMER);
        }

        if (Role.MECHANIC.equals(user.getRole()) || Role.SERVICE_ADVISOR.equals(user.getRole())) {
            user.setApproved(false);
        } else {
            user.setApproved(true);
        }

        return userRepository.save(user);
    }

    public AuthResponse login(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getUsername(), user.getRole().name(), user.getId());
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public java.util.List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public java.util.List<User> getPendingUsers() {
        return userRepository.findByApproved(false).stream()
                .filter(u -> Role.MECHANIC.equals(u.getRole()) || Role.SERVICE_ADVISOR.equals(u.getRole()))
                .collect(java.util.stream.Collectors.toList());
    }

    public void approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        if (Role.CUSTOMER.equals(user.getRole()) || Role.ADMIN.equals(user.getRole())) {
            throw new IllegalArgumentException("Only MECHANIC and SERVICE_ADVISOR accounts can be verified.");
        }
        user.setApproved(true);
        userRepository.save(user);
    }

    public void rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        if (Role.CUSTOMER.equals(user.getRole()) || Role.ADMIN.equals(user.getRole())) {
            throw new IllegalArgumentException("Only MECHANIC and SERVICE_ADVISOR accounts can be rejected.");
        }
        userRepository.delete(user);
    }
}
