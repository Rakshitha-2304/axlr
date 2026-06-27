package com.vehicle.service.notification.repository;

import com.vehicle.service.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetUserIdOrderByTimestampDesc(Long targetUserId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.targetUserId = :targetUserId AND n.isRead = false")
    void markAllAsRead(@Param("targetUserId") Long targetUserId);
}
