package com.vehicle.service.appointment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    @NotNull(message = "Package ID is required")
    private Long packageId;
    
    private Long mechanicId;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime appointmentDate;

    public Appointment() {
    }

    public Appointment(Long customerId, Long vehicleId, Long packageId, Long mechanicId, Status status, LocalDateTime appointmentDate) {
        this.customerId = customerId;
        this.vehicleId = vehicleId;
        this.packageId = packageId;
        this.mechanicId = mechanicId;
        this.status = status;
        this.appointmentDate = appointmentDate;
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

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public Long getMechanicId() {
        return mechanicId;
    }

    public void setMechanicId(Long mechanicId) {
        this.mechanicId = mechanicId;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }
}
