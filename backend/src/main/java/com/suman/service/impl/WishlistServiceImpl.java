package com.suman.service.impl;

import com.suman.dto.response.*;
import com.suman.entity.*;
import com.suman.repository.*;
import com.suman.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Override
    public List<ProductResponse> getWishlist(String email) {
        return wishlistItemRepository.findByUserEmail(email).stream().map(w -> {
            Product p = w.getProduct();
            String img = (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0).getImageUrl() : null;
            return ProductResponse.builder().id(p.getId()).name(p.getName()).slug(p.getSlug())
                .price(p.getPrice()).comparePrice(p.getComparePrice()).primaryImage(img)
                .averageRating(p.getAverageRating()).stockQuantity(p.getStockQuantity())
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null).build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToWishlist(String email, Long productId) {
        if (wishlistItemRepository.existsByUserEmailAndProductId(email, productId)) return;
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        wishlistItemRepository.save(WishlistItem.builder().user(user).product(product).build());
    }

    @Override
    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        wishlistItemRepository.findByUserEmailAndProductId(email, productId).ifPresent(wishlistItemRepository::delete);
    }

    @Override
    @Transactional
    public CartResponse moveToCart(String email, Long productId) {
        removeFromWishlist(email, productId);
        com.suman.dto.request.CartItemRequest req = new com.suman.dto.request.CartItemRequest();
        req.setProductId(productId);
        req.setQuantity(1);
        return cartService.addToCart(email, req);
    }
}
