package com.suman.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String productSlug;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
    private Boolean isReviewed;
    private VariantResponse variant;
}
