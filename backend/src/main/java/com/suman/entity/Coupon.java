package com.suman.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false, length = 50) private String code;
    @Column(length = 255) private String description;
    @Enumerated(EnumType.STRING) @Column(name = "discount_type", nullable = false) private DiscountType discountType;
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2) private BigDecimal discountValue;
    @Column(name = "min_order_amount", precision = 10, scale = 2) @Builder.Default private BigDecimal minOrderAmount = BigDecimal.ZERO;
    @Column(name = "max_discount_amount", precision = 10, scale = 2) private BigDecimal maxDiscountAmount;
    @Column(name = "usage_limit") private Integer usageLimit;
    @Column(name = "used_count") @Builder.Default private Integer usedCount = 0;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = true;
    @Column(name = "valid_from") private LocalDateTime validFrom;
    @Column(name = "valid_until") private LocalDateTime validUntil;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    public enum DiscountType { PERCENTAGE, FIXED }
}
