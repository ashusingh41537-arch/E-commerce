package com.suman.repository;

import com.suman.entity.OrderTracking;
import com.suman.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {
    List<OrderTracking> findByOrderIdOrderByCreatedAtAsc(Long orderId);
    List<OrderTracking> findByOrderOrderByCreatedAtAsc(Order order);
}
