package com.vehicle.service.vehicle.controller;

import com.vehicle.service.vehicle.dto.VehicleDto;
import com.vehicle.service.vehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<VehicleDto> createVehicle(@Valid @RequestBody VehicleDto vehicleDto) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicleDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable("id") Long id) {
        VehicleDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByCustomerId(@PathVariable("customerId") Long customerId) {
        List<VehicleDto> vehicles = vehicleService.getVehiclesByCustomerId(customerId);
        return ResponseEntity.ok(vehicles);
    }
}
