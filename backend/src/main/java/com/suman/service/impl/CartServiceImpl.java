package com.suman.service.impl;

import com.suman.dto.request.CartItemRequest;
import com.suman.dto.response.*;
import com.suman.entity.*;
import com.suman.repository.*;
import com.suman.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public CartResponse getCart(String email) {
        List<CartItem> items = cartItemRepository.findByUserEmail(email);
        return buildCartResponse(items);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String email, CartItemRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        Optional<CartItem> existing = cartItemRepository.findByUserEmailAndProductIdAndVariantId(
            email, request.getProductId(), request.getVariantId());

        CartItem cartItem;
        if (existing.isPresent()) {
            cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity())
                .build();
        }
        cartItemRepository.save(cartItem);

        return getCart(email);
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(String email, Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return getCart(email);
    }

    @Override
    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        cartItemRepository.deleteById(itemId);
        return getCart(email);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        cartItemRepository.deleteByUserEmail(email);
    }

    private CartResponse buildCartResponse(List<CartItem> items) {
        List<CartItemResponse> itemResponses = items.stream().map(item -> {
            Product p = item.getProduct();
            String img = (p.getImages() != null && !p.getImages().isEmpty())
                ? p.getImages().get(0).getImageUrl() : null;
            return CartItemResponse.builder()
                .id(item.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSlug(p.getSlug())
                .productImage(img)
                .price(p.getPrice())
                .comparePrice(p.getComparePrice())
                .quantity(item.getQuantity())
                .total(p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .stockQuantity(p.getStockQuantity())
                .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
            .map(CartItemResponse::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal savings = items.stream().map(item -> {
            Product p = item.getProduct();
            if (p.getComparePrice() != null && p.getComparePrice().compareTo(p.getPrice()) > 0) {
                return p.getComparePrice().subtract(p.getPrice()).multiply(BigDecimal.valueOf(item.getQuantity()));
            }
            return BigDecimal.ZERO;
        }).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
            .items(itemResponses)
            .totalItems(items.stream().mapToInt(CartItem::getQuantity).sum())
            .subtotal(subtotal)
            .savings(savings)
            .build();
    }
}
