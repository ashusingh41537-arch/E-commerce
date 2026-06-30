package com.suman.service.impl;

import com.suman.dto.request.CouponRequest;
import com.suman.dto.response.*;
import com.suman.entity.*;
import com.suman.repository.*;
import com.suman.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue().orElse(BigDecimal.ZERO);
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long deliveredOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        long todayOrders = orderRepository.countByCreatedAtAfter(LocalDateTime.now().withHour(0).withMinute(0));
        BigDecimal todayRevenue = orderRepository.getRevenueFrom(LocalDateTime.now().withHour(0)).orElse(BigDecimal.ZERO);

        List<ProductResponse> topSelling = productRepository.findTop8ByIsActiveTrueOrderByAverageRatingDesc()
            .stream().map(p -> ProductResponse.builder()
                .id(p.getId()).name(p.getName()).price(p.getPrice())
                .soldCount(p.getSoldCount()).averageRating(p.getAverageRating())
                .primaryImage(p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0).getImageUrl() : null)
                .build()).collect(Collectors.toList());

        List<OrderResponse> recentOrders = orderRepository.findAll(
            org.springframework.data.domain.PageRequest.of(0, 10,
                org.springframework.data.domain.Sort.by("createdAt").descending()))
            .stream().map(o -> OrderResponse.builder()
                .id(o.getId()).orderNumber(o.getOrderNumber())
                .totalAmount(o.getTotalAmount()).orderStatus(o.getOrderStatus().name())
                .createdAt(o.getCreatedAt()).build())
            .collect(Collectors.toList());

        return DashboardResponse.builder()
            .totalUsers(totalUsers).totalProducts(totalProducts)
            .totalOrders(totalOrders).totalRevenue(totalRevenue)
            .pendingOrders(pendingOrders).deliveredOrders(deliveredOrders)
            .todayOrders(todayOrders).todayRevenue(todayRevenue)
            .topSellingProducts(topSelling).recentOrders(recentOrders)
            .build();
    }

    @Override
    public AnalyticsResponse getAnalytics(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        BigDecimal totalRevenue = orderRepository.getRevenueFrom(from).orElse(BigDecimal.ZERO);
        long totalOrders = orderRepository.countByCreatedAtAfter(from);
        long newUsers = userRepository.countByCreatedAtAfter(from);

        List<Object[]> monthlyData = orderRepository.getMonthlyRevenue();
        List<RevenueDataPoint> revenueChart = monthlyData.stream().limit(12).map(row ->
            RevenueDataPoint.builder()
                .label(row[0].toString())
                .revenue(row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO)
                .orders(row[2] != null ? Long.parseLong(row[2].toString()) : 0L)
                .build()).collect(Collectors.toList());

        List<CategorySalesData> categorySales = Arrays.asList(
            CategorySalesData.builder().category("Makeup").sales(234L).revenue(BigDecimal.valueOf(45000)).build(),
            CategorySalesData.builder().category("Skincare").sales(189L).revenue(BigDecimal.valueOf(38000)).build(),
            CategorySalesData.builder().category("Bags").sales(98L).revenue(BigDecimal.valueOf(55000)).build(),
            CategorySalesData.builder().category("Clothing").sales(145L).revenue(BigDecimal.valueOf(32000)).build(),
            CategorySalesData.builder().category("Shoes").sales(76L).revenue(BigDecimal.valueOf(28000)).build()
        );

        return AnalyticsResponse.builder()
            .revenueChart(revenueChart).categorySales(categorySales)
            .totalRevenue(totalRevenue).totalOrders(totalOrders).newUsers(newUsers)
            .build();
    }

    @Override
    public List<OrderResponse> getAllOrders(String status) {
        var orders = status != null && !status.isBlank()
            ? orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus().name().equals(status)).collect(Collectors.toList())
            : orderRepository.findAll(org.springframework.data.domain.Sort.by("createdAt").descending()).stream().collect(Collectors.toList());

        return orders.stream().map(o -> OrderResponse.builder()
            .id(o.getId()).orderNumber(o.getOrderNumber())
            .totalAmount(o.getTotalAmount()).orderStatus(o.getOrderStatus().name())
            .paymentStatus(o.getPaymentStatus().name()).paymentMethod(o.getPaymentMethod().name())
            .itemCount(o.getItems() != null ? o.getItems().size() : 0)
            .createdAt(o.getCreatedAt()).build()).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, String status, String message) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(Order.OrderStatus.valueOf(status));
        if (status.equals("DELIVERED")) {
            order.setDeliveredAt(LocalDateTime.now());
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        }
        orderRepository.save(order);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> UserResponse.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .phone(u.getPhone()).role(u.getRole().name())
            .isActive(u.getIsActive()).createdAt(u.getCreatedAt()).build())
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setIsActive(!u.getIsActive());
            userRepository.save(u);
        });
    }

    @Override
    public List<ProductResponse> getAllProductsAdmin() {
        return productRepository.findAll().stream().map(p -> ProductResponse.builder()
            .id(p.getId()).name(p.getName()).slug(p.getSlug())
            .price(p.getPrice()).comparePrice(p.getComparePrice())
            .stockQuantity(p.getStockQuantity())
            .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
            .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
            .averageRating(p.getAverageRating()).reviewCount(p.getReviewCount())
            .soldCount(p.getSoldCount()).isFeatured(p.getIsFeatured())
            .primaryImage(p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0).getImageUrl() : null)
            .build()).collect(Collectors.toList());
    }

    @Override
    public List<RevenueDataPoint> getRevenueData(String type) {
        List<Object[]> data = orderRepository.getMonthlyRevenue();
        return data.stream().limit(12).map(row -> RevenueDataPoint.builder()
            .label(row[0].toString())
            .revenue(row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO)
            .orders(row[2] != null ? Long.parseLong(row[2].toString()) : 0L)
            .build()).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        Coupon coupon = Coupon.builder()
            .code(request.getCode().toUpperCase())
            .description(request.getDescription())
            .discountType(Coupon.DiscountType.valueOf(request.getDiscountType()))
            .discountValue(request.getDiscountValue())
            .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
            .maxDiscountAmount(request.getMaxDiscountAmount())
            .usageLimit(request.getUsageLimit())
            .isActive(true)
            .build();
        coupon = couponRepository.save(coupon);
        return CouponResponse.builder()
            .id(coupon.getId()).code(coupon.getCode())
            .description(coupon.getDescription())
            .discountType(coupon.getDiscountType().name())
            .discountValue(coupon.getDiscountValue())
            .isValid(true).build();
    }
}
