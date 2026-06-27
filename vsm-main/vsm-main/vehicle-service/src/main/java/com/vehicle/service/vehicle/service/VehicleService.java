package com.vehicle.service.vehicle.service;

import com.vehicle.service.vehicle.dto.VehicleDto;
import com.vehicle.service.vehicle.entity.Vehicle;
import com.vehicle.service.vehicle.exception.ResourceNotFoundException;
import com.vehicle.service.vehicle.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public VehicleDto createVehicle(VehicleDto vehicleDto) {
        Vehicle vehicle = new Vehicle(
                null,
                vehicleDto.getCustomerId(),
                vehicleDto.getMake(),
                vehicleDto.getModel(),
                vehicleDto.getYear(),
                vehicleDto.getLicensePlate()
        );
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToDto(savedVehicle);
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return mapToDto(vehicle);
    }

    public List<VehicleDto> getVehiclesByCustomerId(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        return new VehicleDto(
                vehicle.getId(),
                vehicle.getCustomerId(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getLicensePlate()
        );
    }
}
