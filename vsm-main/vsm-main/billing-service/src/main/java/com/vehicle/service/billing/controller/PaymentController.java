package com.vehicle.service.billing.controller;

import com.vehicle.service.billing.entity.Payment;
import com.vehicle.service.billing.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody Payment payment) {
        Payment processedPayment = paymentService.processPayment(payment);
        return ResponseEntity.ok(processedPayment);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<java.util.List<Payment>> getPaymentsByCustomerId(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCustomerId(customerId));
    }

    @GetMapping
    public ResponseEntity<java.util.List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
