package com.suman.dto.request;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemRequest {
    private Long productId;
    private Long variantId;
    private Integer quantity = 1;
}
