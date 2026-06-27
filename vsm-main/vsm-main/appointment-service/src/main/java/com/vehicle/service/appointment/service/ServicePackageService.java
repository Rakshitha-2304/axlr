package com.vehicle.service.appointment.service;

import com.vehicle.service.appointment.entity.ServicePackage;
import com.vehicle.service.appointment.repository.ServicePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicePackageService {

    @Autowired
    private ServicePackageRepository repository;

    public ServicePackage createPackage(ServicePackage servicePackage) {
        return repository.save(servicePackage);
    }

    public List<ServicePackage> getAllPackages() {
        return repository.findAll();
    }

    public ServicePackage getPackageById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Package not found"));
    }

    public ServicePackage updatePackage(Long id, ServicePackage servicePackageDetails) {
        ServicePackage existing = getPackageById(id);
        existing.setName(servicePackageDetails.getName());
        existing.setPrice(servicePackageDetails.getPrice());
        existing.setDescription(servicePackageDetails.getDescription());
        return repository.save(existing);
    }

    public void deletePackage(Long id) {
        repository.deleteById(id);
    }
}
