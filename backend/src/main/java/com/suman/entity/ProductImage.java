package com.suman.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @Column(name = "image_url", nullable = false, length = 500) private String imageUrl;
    @Column(name = "alt_text", length = 255) private String altText;
    @Column(name = "is_primary") @Builder.Default private Boolean isPrimary = false;
    @Column(name = "sort_order") @Builder.Default private Integer sortOrder = 0;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
