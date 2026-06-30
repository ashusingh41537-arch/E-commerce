package com.suman.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal comparePrice;
    private Integer stockQuantity;
    private String primaryImage;
    private String categoryName;
    private String brandName;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private Integer soldCount;
    private Boolean isFeatured;
    private Boolean isTrending;
    private BigDecimal discountPercent;
}
