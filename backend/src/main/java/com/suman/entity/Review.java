package com.suman.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_item_id") private OrderItem orderItem;
    @Column(nullable = false) private Integer rating;
    @Column(length = 255) private String title;
    @Column(columnDefinition = "TEXT") private String comment;
    @Column(name = "is_verified_purchase") @Builder.Default private Boolean isVerifiedPurchase = false;
    @Column(name = "is_approved") @Builder.Default private Boolean isApproved = true;
    @Column(name = "helpful_count") @Builder.Default private Integer helpfulCount = 0;
    @Column(length = 1000) private String images;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
