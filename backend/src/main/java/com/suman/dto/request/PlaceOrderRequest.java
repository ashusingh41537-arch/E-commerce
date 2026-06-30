package com.suman.dto.request;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class PlaceOrderRequest {
    private Long addressId;
    private String paymentMethod;
    private String couponCode;
    private String notes;
}
