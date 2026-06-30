package com.suman.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal comparePrice;
    private String sku;
    private Integer stockQuantity;
    private List<String> images;
    private List<VariantResponse> variants;
    private CategoryResponse category;
    private BrandResponse brand;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private Integer soldCount;
    private List<ReviewResponse> topReviews;
    private String tags;
    private LocalDateTime createdAt;
}
