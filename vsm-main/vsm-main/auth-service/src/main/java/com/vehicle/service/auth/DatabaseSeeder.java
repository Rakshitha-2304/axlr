package com.vehicle.service.auth;

import com.vehicle.service.auth.entity.Role;
import com.vehicle.service.auth.entity.User;
import com.vehicle.service.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Pre-seed static admin if not already present
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                "admin",
                passwordEncoder.encode("admin123"),
                "admin@vsm.com",
                Role.ADMIN
            );
            admin.setApproved(true);
            userRepository.save(admin);
            System.out.println(">>> Static administrator account seeded successfully (Username: admin, Password: admin123)");
        } else {
            // Make sure existing admin is approved
            userRepository.findByUsername("admin").ifPresent(admin -> {
                if (!admin.isApproved()) {
                    admin.setApproved(true);
                    userRepository.save(admin);
                    System.out.println(">>> Existing administrator account verified and marked as approved.");
                }
            });
        }

        // Auto-approve existing customers/admins who might have defaulted to false upon SQL schema update
        userRepository.findAll().forEach(u -> {
            if (!u.isApproved() && (Role.ADMIN.equals(u.getRole()) || Role.CUSTOMER.equals(u.getRole()))) {
                u.setApproved(true);
                userRepository.save(u);
                System.out.println(">>> Auto-approved existing " + u.getRole() + " user: " + u.getUsername());
            }
        });
    }
}
