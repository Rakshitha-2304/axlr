package com.vehicle.service.auth.repository;

import com.vehicle.service.auth.entity.User;
import com.vehicle.service.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(Role role);
    java.util.List<User> findByApproved(boolean approved);
}
