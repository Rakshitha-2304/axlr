package com.vehicle.service.customer.controller;

import com.vehicle.service.customer.dto.CustomerDto;
import com.vehicle.service.customer.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerDto customerDto) {
        CustomerDto created = customerService.createCustomer(customerDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CustomerDto> getCustomerByUserId(@PathVariable("userId") Long userId) {
        CustomerDto customerDto = customerService.getCustomerByUserId(userId);
        return ResponseEntity.ok(customerDto);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable("userId") Long userId, @Valid @RequestBody CustomerDto customerDto) {
        CustomerDto updatedCustomer = customerService.updateCustomer(userId, customerDto);
        return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
    }
}
