package com.vehicle.service.appointment.repository;

import com.vehicle.service.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerId(Long customerId);
    List<Appointment> findByMechanicId(Long mechanicId);
    boolean existsByVehicleIdAndAppointmentDate(Long vehicleId, java.time.LocalDateTime appointmentDate);
}
