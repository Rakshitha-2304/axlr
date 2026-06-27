package com.vehicle.service.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CustomerDto {
    private Long id;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    private String address;
    
    public CustomerDto() {}
    
    public CustomerDto(Long id, Long userId, String fullName, String phone, String address) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
