package com.suman.service;
import com.suman.entity.Order;
public interface EmailService {
    void sendWelcomeEmail(String to, String name);
    void sendOtpEmail(String to, String otp, String name);
    void sendOrderConfirmationEmail(String to, Order order);
}
