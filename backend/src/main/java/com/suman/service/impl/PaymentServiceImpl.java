package com.suman.service.impl;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.suman.dto.request.PaymentVerifyRequest;
import com.suman.entity.Order;
import com.suman.repository.OrderRepository;
import com.suman.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Override
    public Map<String, Object> createRazorpayOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject options = new JSONObject();
            options.put("amount", order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100)).intValue());
            options.put("currency", "INR");
            options.put("receipt", order.getOrderNumber());

            com.razorpay.Order rzpOrder = client.orders.create(options);
            order.setRazorpayOrderId(rzpOrder.get("id").toString());
            orderRepository.save(order);

            Map<String, Object> result = new HashMap<>();
            result.put("razorpayOrderId", rzpOrder.get("id").toString());
            result.put("amount", rzpOrder.get("amount"));
            result.put("currency", "INR");
            result.put("keyId", razorpayKeyId);
            return result;
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerifyRequest request) {
        String data = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        if (!verifySignature(data, request.getRazorpaySignature())) {
            throw new RuntimeException("Payment verification failed - invalid signature");
        }
        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setOrderStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        if (verifySignature(payload, signature)) {
            // Process webhook events (payment.captured, payment.failed, etc.)
        }
    }

    private boolean verifySignature(String data, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
