package com.suman.controller;

import com.suman.dto.request.*;
import com.suman.dto.response.*;
import com.suman.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ======================== ADMIN CONTROLLER ========================
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(null, adminService.getDashboardStats()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(null, adminService.getAnalytics(days)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(null, adminService.getAllOrders(status)));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<String>> updateOrderStatus(
            @PathVariable Long orderId, @RequestBody Map<String, String> body) {
        adminService.updateOrderStatus(orderId, body.get("status"), body.get("message"));
        return ResponseEntity.ok(ApiResponse.success("Order status updated", null));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(null, adminService.getAllUsers()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProductsAdmin() {
        return ResponseEntity.ok(ApiResponse.success(null, adminService.getAllProductsAdmin()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenueDataPoint>>> getRevenue(
            @RequestParam(defaultValue = "monthly") String type) {
        return ResponseEntity.ok(ApiResponse.success(null, adminService.getRevenueData(type)));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created", adminService.createCoupon(request)));
    }
}

// ======================== PAYMENT CONTROLLER ========================
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRazorpayOrder(
            @RequestBody Map<String, Object> body, Authentication auth) {
        Long orderId = Long.parseLong(body.get("orderId").toString());
        return ResponseEntity.ok(ApiResponse.success(null, paymentService.createRazorpayOrder(orderId)));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyPayment(
            @RequestBody PaymentVerifyRequest request, Authentication auth) {
        paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", null));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> razorpayWebhook(@RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }
}

// ======================== SEARCH CONTROLLER ========================
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
class SearchController {
    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResponse>> search(
            @RequestParam String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String brand) {
        return ResponseEntity.ok(ApiResponse.success(null, searchService.search(q, category, minPrice, maxPrice, minRating, brand)));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSuggestions(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(null, searchService.getSuggestions(q)));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<String>>> getTrendingSearches() {
        return ResponseEntity.ok(ApiResponse.success(null, searchService.getTrendingSearches()));
    }
}

// ======================== NOTIFICATION CONTROLLER ========================
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, notificationService.getUserNotifications(auth.getName())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, notificationService.getUnreadCount(auth.getName())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id, Authentication auth) {
        notificationService.markAsRead(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}

// ======================== COUPON CONTROLLER ========================
@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
class CouponController {
    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @RequestBody Map<String, Object> body, Authentication auth) {
        String code = (String) body.get("code");
        Double amount = Double.parseDouble(body.get("amount").toString());
        return ResponseEntity.ok(ApiResponse.success("Coupon applied!", couponService.validateCoupon(code, amount, auth.getName())));
    }
}

// ======================== USER CONTROLLER ========================
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, userService.getProfile(auth.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody UpdateProfileRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(auth.getName(), request)));
    }

    @GetMapping("/recently-viewed")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getRecentlyViewed(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, userService.getRecentlyViewed(auth.getName())));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @RequestBody AddressRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Address added", userService.addAddress(auth.getName(), request)));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, userService.getAddresses(auth.getName())));
    }
}
