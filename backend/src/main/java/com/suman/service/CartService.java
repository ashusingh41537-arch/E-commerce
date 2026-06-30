package com.suman.service;
import com.suman.dto.request.CartItemRequest;
import com.suman.dto.response.CartResponse;
public interface CartService {
    CartResponse getCart(String email);
    CartResponse addToCart(String email, CartItemRequest request);
    CartResponse updateQuantity(String email, Long itemId, int quantity);
    CartResponse removeItem(String email, Long itemId);
    void clearCart(String email);
}
