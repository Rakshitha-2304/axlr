package com.vehicle.service.billing.service;

import com.vehicle.service.billing.entity.Payment;
import com.vehicle.service.billing.entity.PaymentStatus;
import com.vehicle.service.billing.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    
    private static final String NOTIFICATION_TOPIC = "notification-topic";

    @Autowired
    public PaymentService(PaymentRepository paymentRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Payment processPayment(Payment payment) {
        payment.setStatus(PaymentStatus.SUCCESSFUL);
        payment.setPaymentDate(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);
        
        // Send Kafka event
        String jsonMessage = String.format("{\"event\": \"PAYMENT_SUCCESSFUL\", \"appointmentId\": %d, \"customerId\": %d, \"amount\": %s}",
                savedPayment.getAppointmentId(), savedPayment.getCustomerId(), savedPayment.getAmount().toString());
        
        kafkaTemplate.send(NOTIFICATION_TOPIC, savedPayment.getCustomerId().toString(), jsonMessage);
        
        return savedPayment;
    }

    public java.util.List<Payment> getPaymentsByCustomerId(Long customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }

    public java.util.List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
