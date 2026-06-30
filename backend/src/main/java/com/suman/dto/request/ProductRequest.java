package com.suman.dto.request;
import lombok.*;
import java.math.BigDecimal;
@Data @NoArgsConstructor @AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal comparePrice;
    private String sku;
    private Integer stockQuantity;
    private Long categoryId;
    private Long brandId;
    private Boolean isFeatured;
    private Boolean isTrending;
    private String tags;
}
