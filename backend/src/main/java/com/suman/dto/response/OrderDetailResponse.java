package com.suman.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private String orderNumber;
    private List<OrderItemResponse> items;
    private AddressResponse address;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingCharge;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String trackingNumber;
    private String estimatedDelivery;
    private List<TrackingResponse> trackingHistory;
    private String invoiceUrl;
    private LocalDateTime createdAt;
}
