package com.suman.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImage;
    private BigDecimal price;
    private BigDecimal comparePrice;
    private Integer quantity;
    private BigDecimal total;
    private VariantResponse variant;
    private Integer stockQuantity;
}
