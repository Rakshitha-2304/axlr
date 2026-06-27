package com.vehicle.service.appointment.controller;

import com.vehicle.service.appointment.entity.Appointment;
import com.vehicle.service.appointment.entity.Status;
import com.vehicle.service.appointment.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody Appointment appointment) {
        Appointment created = appointmentService.createAppointment(appointment);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByCustomer(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByCustomer(customerId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable("id") Long id, 
            @RequestBody Map<String, String> updates,
            @RequestHeader(value = "role", required = false) String role) {
        String statusStr = updates.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().build();
        }
        Status newStatus = Status.valueOf(statusStr.toUpperCase());
        
        if ("MECHANIC".equals(role) && newStatus != Status.IN_PROGRESS && newStatus != Status.COMPLETED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Mechanics can only set status to IN_PROGRESS or COMPLETED.");
        }
        
        Appointment updated = appointmentService.updateAppointmentStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/mechanic")
    public ResponseEntity<?> updateAppointmentMechanic(
            @PathVariable("id") Long id, 
            @RequestBody Map<String, String> updates,
            @RequestHeader(value = "role", required = false) String role) {
        if (!"ADMIN".equals(role) && !"SERVICE_ADVISOR".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN and SERVICE_ADVISOR roles can assign mechanics.");
        }
        
        String mechanicIdStr = updates.get("mechanicId");
        if (mechanicIdStr == null || mechanicIdStr.trim().isEmpty()) {
            Appointment updated = appointmentService.updateAppointmentMechanic(id, null);
            return ResponseEntity.ok(updated);
        }
        Long mechanicId = Long.valueOf(mechanicIdStr);
        Appointment updated = appointmentService.updateAppointmentMechanic(id, mechanicId);
        return ResponseEntity.ok(updated);
    }
}
