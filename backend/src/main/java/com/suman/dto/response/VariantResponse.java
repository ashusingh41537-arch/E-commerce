package com.suman.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VariantResponse {
    private Long id;
    private String size;
    private String color;
    private String colorHex;
    private String shade;
    private BigDecimal additionalPrice;
    private Integer stockQuantity;
    private String imageUrl;
}
