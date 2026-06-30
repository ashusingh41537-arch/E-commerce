package com.suman.controller;

import com.suman.dto.request.*;
import com.suman.dto.response.*;
import com.suman.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ======================== CART CONTROLLER ========================
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, cartService.getCart(auth.getName())));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestBody CartItemRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Added to cart", cartService.addToCart(auth.getName(), request)));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCart(
            @PathVariable Long itemId, @RequestBody Map<String, Integer> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Cart updated",
                cartService.updateQuantity(auth.getName(), itemId, body.get("quantity"))));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable Long itemId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Removed from cart", cartService.removeItem(auth.getName(), itemId)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart(Authentication auth) {
        cartService.clearCart(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}

// ======================== WISHLIST CONTROLLER ========================
@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getWishlist(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, wishlistService.getWishlist(auth.getName())));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<ApiResponse<String>> addToWishlist(
            @PathVariable Long productId, Authentication auth) {
        wishlistService.addToWishlist(auth.getName(), productId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", null));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @PathVariable Long productId, Authentication auth) {
        wishlistService.removeFromWishlist(auth.getName(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @PostMapping("/move-to-cart/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> moveToCart(
            @PathVariable Long productId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Moved to cart",
                wishlistService.moveToCart(auth.getName(), productId)));
    }
}

// ======================== ORDER CONTROLLER ========================
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
class OrderController {
    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully!",
                orderService.placeOrder(auth.getName(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null, orderService.getUserOrders(auth.getName())));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrder(
            @PathVariable String orderNumber, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(null,
                orderService.getOrderDetail(auth.getName(), orderNumber)));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body, Authentication auth) {
        orderService.cancelOrder(auth.getName(), orderId, body.get("reason"));
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }

    @PostMapping("/{orderId}/return")
    public ResponseEntity<ApiResponse<String>> returnOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body, Authentication auth) {
        orderService.returnOrder(auth.getName(), orderId, body.get("reason"));
        return ResponseEntity.ok(ApiResponse.success("Return request submitted", null));
    }

    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId, Authentication auth) {
        return orderService.generateInvoice(auth.getName(), orderId);
    }
}

// ======================== REVIEW CONTROLLER ========================
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(null, reviewService.getProductReviews(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @Valid @RequestBody ReviewRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Review added successfully",
                reviewService.addReview(auth.getName(), request)));
    }

    @PutMapping("/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<String>> markHelpful(
            @PathVariable Long reviewId, Authentication auth) {
        reviewService.markHelpful(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Marked as helpful", null));
    }
}
