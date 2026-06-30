package com.suman.service;
import com.suman.dto.request.CouponRequest;
import com.suman.dto.response.*;
import java.util.List;
public interface AdminService {
    DashboardResponse getDashboardStats();
    AnalyticsResponse getAnalytics(int days);
    List<OrderResponse> getAllOrders(String status);
    void updateOrderStatus(Long orderId, String status, String message);
    List<UserResponse> getAllUsers();
    void toggleUserStatus(Long userId);
    List<ProductResponse> getAllProductsAdmin();
    List<RevenueDataPoint> getRevenueData(String type);
    CouponResponse createCoupon(CouponRequest request);
}
