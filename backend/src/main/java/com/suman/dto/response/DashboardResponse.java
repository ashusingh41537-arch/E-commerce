package com.suman.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long pendingOrders;
    private Long deliveredOrders;
    private Long todayOrders;
    private BigDecimal todayRevenue;
    private List<ProductResponse> topSellingProducts;
    private List<OrderResponse> recentOrders;
}
