package com.suman.service;
import com.suman.dto.request.PlaceOrderRequest;
import com.suman.dto.response.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
public interface OrderService {
    OrderResponse placeOrder(String email, PlaceOrderRequest request);
    List<OrderResponse> getUserOrders(String email);
    OrderDetailResponse getOrderDetail(String email, String orderNumber);
    void cancelOrder(String email, Long orderId, String reason);
    void returnOrder(String email, Long orderId, String reason);
    ResponseEntity<byte[]> generateInvoice(String email, Long orderId);
}
