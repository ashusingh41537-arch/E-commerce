package com.suman.service.impl;

import com.suman.entity.Order;
import com.suman.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void sendWelcomeEmail(String to, String name) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(to);
            h.setSubject("Welcome to Suman Beauty & Fashion!");
            h.setText("<div style='font-family:Arial;padding:32px'>"
                + "<h1 style='color:#e91e63'>Welcome to SUMAN!</h1>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<p>Welcome to Suman Beauty and Fashion!</p>"
                + "<p>Use code <strong>WELCOME10</strong> for 10% off your first order.</p>"
                + "</div>", true);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Welcome email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendOtpEmail(String to, String otp, String name) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(to);
            h.setSubject("Your OTP: " + otp + " - Suman");
            h.setText("<div style='font-family:Arial;padding:32px'>"
                + "<h2 style='color:#e91e63'>Password Reset OTP</h2>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<div style='background:#f5f5f5;padding:24px;text-align:center;border-radius:8px'>"
                + "<h1 style='color:#e91e63;letter-spacing:12px'>" + otp + "</h1></div>"
                + "<p>This OTP expires in <strong>10 minutes</strong>. Do not share it.</p>"
                + "</div>", true);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("OTP email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendOrderConfirmationEmail(String to, Order order) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(to);
            h.setSubject("Order Confirmed! #" + order.getOrderNumber());
            h.setText("<div style='font-family:Arial;padding:32px'>"
                + "<h2 style='color:#e91e63'>Order Confirmed!</h2>"
                + "<p>Order <strong>#" + order.getOrderNumber() + "</strong> placed successfully.</p>"
                + "<p>Total: <strong>Rs." + order.getTotalAmount() + "</strong></p>"
                + "<p>Payment: " + order.getPaymentMethod() + "</p>"
                + "<p>Estimated Delivery: " + order.getEstimatedDelivery() + "</p>"
                + "</div>", true);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Order email failed: " + e.getMessage());
        }
    }
}
