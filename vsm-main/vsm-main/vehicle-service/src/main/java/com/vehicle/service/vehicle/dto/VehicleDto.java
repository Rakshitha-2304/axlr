package com.vehicle.service.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class VehicleDto {
    private Long id;
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotBlank(message = "Make is required")
    private String make;
    
    @NotBlank(message = "Model is required")
    private String model;
    
    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be valid")
    private Integer year;
    
    @NotBlank(message = "License plate is required")
    private String licensePlate;

    public VehicleDto() {}

    public VehicleDto(Long id, Long customerId, String make, String model, Integer year, String licensePlate) {
        this.id = id;
        this.customerId = customerId;
        this.make = make;
        this.model = model;
        this.year = year;
        this.licensePlate = licensePlate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }
}
