package com.suman.service.impl;

import com.suman.dto.response.NotificationResponse;
import com.suman.entity.*;
import com.suman.repository.NotificationRepository;
import com.suman.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<NotificationResponse> getUserNotifications(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long id) {
        notificationRepository.findByIdAndUserEmail(id, email).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        notificationRepository.markAllAsRead(email);
    }

    @Override
    @Transactional
    public void sendOrderNotification(User user, Order order, String title, String message) {
        Notification notif = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(Notification.NotificationType.ORDER)
            .isRead(false)
            .link("/orders/" + order.getOrderNumber())
            .build();
        notificationRepository.save(notif);

        try {
            messagingTemplate.convertAndSendToUser(
                user.getEmail(), "/queue/notifications", toResponse(notif));
        } catch (Exception e) {
            // WebSocket send failed silently - notification still persisted in DB
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType().name())
            .isRead(n.getIsRead())
            .link(n.getLink())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
