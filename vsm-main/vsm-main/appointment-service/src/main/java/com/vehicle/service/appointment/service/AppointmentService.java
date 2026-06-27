package com.vehicle.service.appointment.service;

import com.vehicle.service.appointment.entity.Appointment;
import com.vehicle.service.appointment.entity.Status;
import com.vehicle.service.appointment.exception.ResourceNotFoundException;
import com.vehicle.service.appointment.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    public Appointment createAppointment(Appointment appointment) {
        if (appointment.getAppointmentDate() == null) {
            appointment.setAppointmentDate(LocalDateTime.now());
        }
        if (appointment.getStatus() == null) {
            appointment.setStatus(Status.PENDING);
        }
        
        if (appointmentRepository.existsByVehicleIdAndAppointmentDate(appointment.getVehicleId(), appointment.getAppointmentDate())) {
            throw new IllegalArgumentException("This vehicle already has an appointment scheduled at the selected date and time.");
        }
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Send APPOINTMENT_BOOKED event
        String message = String.format("{\"event\": \"APPOINTMENT_BOOKED\", \"appointmentId\": %d, \"customerId\": %d}", 
                savedAppointment.getId(), savedAppointment.getCustomerId());
        kafkaProducerService.sendMessage(message);
        
        return savedAppointment;
    }

    public Appointment updateAppointmentStatus(Long id, Status newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
                
        appointment.setStatus(newStatus);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        if (newStatus == Status.COMPLETED) {
            // Send APPOINTMENT_COMPLETED event
            String message = String.format("{\"event\": \"APPOINTMENT_COMPLETED\", \"appointmentId\": %d, \"customerId\": %d}", 
                    updatedAppointment.getId(), updatedAppointment.getCustomerId());
            kafkaProducerService.sendMessage(message);
        }
        
        return updatedAppointment;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public List<Appointment> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public Appointment updateAppointmentMechanic(Long id, Long mechanicId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setMechanicId(mechanicId);
        if (appointment.getStatus() == Status.PENDING && mechanicId != null) {
            appointment.setStatus(Status.ASSIGNED);
        }
        return appointmentRepository.save(appointment);
    }
}
