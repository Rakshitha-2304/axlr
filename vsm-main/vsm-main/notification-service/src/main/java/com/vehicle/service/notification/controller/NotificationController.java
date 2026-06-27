package com.vehicle.service.notification.controller;

import com.vehicle.service.notification.entity.Notification;
import com.vehicle.service.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable("userId") Long userId) {
        List<Notification> notifications = notificationRepository.findByTargetUserIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{userId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("userId") Long userId) {
        notificationRepository.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
