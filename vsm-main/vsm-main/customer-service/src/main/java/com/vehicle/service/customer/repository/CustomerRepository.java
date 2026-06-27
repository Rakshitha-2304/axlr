package com.vehicle.service.customer.repository;

import com.vehicle.service.customer.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerProfile, Long> {
    Optional<CustomerProfile> findByUserId(Long userId);
}
