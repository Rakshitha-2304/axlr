package com.vehicle.service.appointment.controller;

import com.vehicle.service.appointment.entity.ServicePackage;
import com.vehicle.service.appointment.service.ServicePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/packages")
public class ServicePackageController {

    @Autowired
    private ServicePackageService service;

    @PostMapping
    public ResponseEntity<ServicePackage> createPackage(@Valid @RequestBody ServicePackage servicePackage) {
        ServicePackage created = service.createPackage(servicePackage);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ServicePackage>> getAllPackages() {
        return ResponseEntity.ok(service.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicePackage> getPackageById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getPackageById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicePackage> updatePackage(@PathVariable("id") Long id, @RequestBody ServicePackage servicePackage) {
        return ResponseEntity.ok(service.updatePackage(id, servicePackage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable("id") Long id) {
        service.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
