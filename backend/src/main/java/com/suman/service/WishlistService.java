package com.suman.service;
import com.suman.dto.response.*;
import java.util.List;
public interface WishlistService {
    List<ProductResponse> getWishlist(String email);
    void addToWishlist(String email, Long productId);
    void removeFromWishlist(String email, Long productId);
    CartResponse moveToCart(String email, Long productId);
}
