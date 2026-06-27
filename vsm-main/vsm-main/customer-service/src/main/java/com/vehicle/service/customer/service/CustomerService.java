package com.vehicle.service.customer.service;

import com.vehicle.service.customer.dto.CustomerDto;
import com.vehicle.service.customer.entity.CustomerProfile;
import com.vehicle.service.customer.exception.ResourceNotFoundException;
import com.vehicle.service.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerDto createCustomer(CustomerDto customerDto) {
        Optional<CustomerProfile> existingProfile = customerRepository.findByUserId(customerDto.getUserId());
        if (existingProfile.isPresent()) {
            throw new RuntimeException("Customer profile already exists for user ID: " + customerDto.getUserId());
        }
        
        CustomerProfile profile = new CustomerProfile();
        profile.setUserId(customerDto.getUserId());
        profile.setFullName(customerDto.getFullName());
        profile.setPhone(customerDto.getPhone());
        profile.setAddress(customerDto.getAddress());
        
        CustomerProfile savedProfile = customerRepository.save(profile);
        return mapToDto(savedProfile);
    }

    public CustomerDto getCustomerByUserId(Long userId) {
        CustomerProfile profile = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user ID: " + userId));
        return mapToDto(profile);
    }

    public CustomerDto updateCustomer(Long userId, CustomerDto customerDto) {
        CustomerProfile profile = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user ID: " + userId));
        
        profile.setFullName(customerDto.getFullName());
        profile.setPhone(customerDto.getPhone());
        profile.setAddress(customerDto.getAddress());
        
        CustomerProfile updatedProfile = customerRepository.save(profile);
        return mapToDto(updatedProfile);
    }

    private CustomerDto mapToDto(CustomerProfile profile) {
        return new CustomerDto(
                profile.getId(),
                profile.getUserId(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getAddress()
        );
    }
}
