package com.vehicle.service.notification.service;

import com.vehicle.service.notification.entity.Notification;
import com.vehicle.service.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.apache.kafka.clients.consumer.ConsumerRecord;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

@Service
public class KafkaConsumerService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public KafkaConsumerService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consume(ConsumerRecord<String, String> record) {
        String message = record.value();
        String key = record.key();
        
        Long targetUserId = null;
        String formattedMessage = message;

        // Try extracting targetUserId from the record key first
        if (key != null) {
            try {
                targetUserId = Long.parseLong(key.trim());
            } catch (NumberFormatException e) {
                // fall through
            }
        }

        // If key was not a valid user ID, parse message
        try {
            if (message.trim().startsWith("{")) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(message);
                if (rootNode.has("event")) {
                    String event = rootNode.get("event").asText();
                    long appointmentId = rootNode.has("appointmentId") ? rootNode.get("appointmentId").asLong() : 0;
                    long customerId = rootNode.has("customerId") ? rootNode.get("customerId").asLong() : 0;
                    
                    if (targetUserId == null && customerId > 0) {
                        targetUserId = customerId;
                    }

                    if ("APPOINTMENT_BOOKED".equals(event)) {
                        formattedMessage = String.format("APPOINTMENT_BOOKED: Appointment #%d has been scheduled successfully for customer %d", appointmentId, customerId);
                    } else if ("APPOINTMENT_COMPLETED".equals(event)) {
                        formattedMessage = String.format("APPOINTMENT_COMPLETED: Service cycle finished for appointment #%d for customer %d", appointmentId, customerId);
                    } else if ("PAYMENT_SUCCESSFUL".equals(event)) {
                        double amount = rootNode.has("amount") ? rootNode.get("amount").asDouble() : 0.0;
                        formattedMessage = String.format("PAYMENT_SUCCESSFUL: Payment of %.2f received for appointment %d by customer %d", amount, appointmentId, customerId);
                    }
                }
            } else {
                if (targetUserId == null) {
                    targetUserId = extractUserIdFromMessage(message);
                }
            }
        } catch (Exception e) {
            if (targetUserId == null) {
                targetUserId = extractUserIdFromMessage(message);
            }
        }

        // If still null, use the default fallback user ID
        if (targetUserId == null) {
            targetUserId = 1L;
        }

        Notification notification = new Notification();
        notification.setMessage(formattedMessage);
        notification.setTargetUserId(targetUserId);
        notification.setTimestamp(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
    
    private Long extractUserIdFromMessage(String message) {
        // Simple mock extraction logic to avoid complexity for this sample
        try {
            if (message.contains("customer ")) {
                String idStr = message.substring(message.lastIndexOf("customer ") + 9).trim();
                return Long.parseLong(idStr);
            }
        } catch (Exception e) {
            // fallback
        }
        return null;
    }
}
