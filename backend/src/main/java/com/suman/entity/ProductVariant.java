package com.suman.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @Column(length = 50) private String size;
    @Column(length = 50) private String color;
    @Column(name = "color_hex", length = 10) private String colorHex;
    @Column(length = 100) private String shade;
    @Column(name = "additional_price", precision = 10, scale = 2) @Builder.Default private BigDecimal additionalPrice = BigDecimal.ZERO;
    @Column(name = "stock_quantity") @Builder.Default private Integer stockQuantity = 0;
    @Column(length = 100) private String sku;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
