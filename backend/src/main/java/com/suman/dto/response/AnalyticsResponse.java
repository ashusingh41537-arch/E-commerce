package com.suman.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnalyticsResponse {
    private List<RevenueDataPoint> revenueChart;
    private List<CategorySalesData> categorySales;
    private List<UserGrowthData> userGrowth;
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long newUsers;
}
