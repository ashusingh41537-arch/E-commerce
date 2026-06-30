package com.suman.service;
import com.suman.dto.response.NotificationResponse;
import com.suman.entity.*;
import java.util.List;
public interface NotificationService {
    List<NotificationResponse> getUserNotifications(String email);
    long getUnreadCount(String email);
    void markAsRead(String email, Long id);
    void markAllAsRead(String email);
    void sendOrderNotification(User user, Order order, String title, String message);
}
