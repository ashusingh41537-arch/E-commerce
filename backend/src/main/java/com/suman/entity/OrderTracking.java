package com.suman.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderTracking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Order.OrderStatus status;
    @Column(columnDefinition = "TEXT") private String message;
    @Column(length = 255) private String location;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
