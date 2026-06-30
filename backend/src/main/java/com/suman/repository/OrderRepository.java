package com.suman.repository;
import com.suman.entity.Order;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);
    Optional<Order> findByOrderNumberAndUserEmail(String orderNumber, String email);
    Optional<Order> findByIdAndUserEmail(Long id, String email);
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID'")
    Optional<BigDecimal> getTotalRevenue();
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt >= :from")
    Optional<BigDecimal> getRevenueFrom(@Param("from") LocalDateTime from);
    @Query("SELECT FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m') as month, SUM(o.totalAmount) as revenue, COUNT(o) as orders FROM Order o WHERE o.paymentStatus = 'PAID' GROUP BY month ORDER BY month DESC")
    List<Object[]> getMonthlyRevenue();
    long countByCreatedAtAfter(LocalDateTime date);
}
