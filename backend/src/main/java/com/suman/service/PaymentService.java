package com.suman.service;
import com.suman.dto.request.PaymentVerifyRequest;
import java.util.Map;
public interface PaymentService {
    Map<String, Object> createRazorpayOrder(Long orderId);
    void verifyPayment(PaymentVerifyRequest request);
    void handleWebhook(String payload, String signature);
}
