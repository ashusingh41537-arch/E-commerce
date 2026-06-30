package com.suman.service.impl;

import com.suman.dto.request.ReviewRequest;
import com.suman.dto.response.ReviewResponse;
import com.suman.entity.*;
import com.suman.repository.*;
import com.suman.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(productId)
            .stream().map(r -> ReviewResponse.builder()
                .id(r.getId()).userName(r.getUser().getName()).rating(r.getRating())
                .title(r.getTitle()).comment(r.getComment()).isVerifiedPurchase(r.getIsVerifiedPurchase())
                .helpfulCount(r.getHelpfulCount()).createdAt(r.getCreatedAt()).build())
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse addReview(String email, ReviewRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = Review.builder().product(product).user(user).rating(request.getRating())
            .title(request.getTitle()).comment(request.getComment()).isApproved(true)
            .isVerifiedPurchase(false).helpfulCount(0).build();
        review = reviewRepository.save(review);

        // Update product rating
        Double avgRating = reviewRepository.getAverageRating(product.getId()).orElse(0.0);
        long reviewCount = reviewRepository.countByProductId(product.getId());
        product.setAverageRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
        product.setReviewCount((int) reviewCount);
        productRepository.save(product);

        return ReviewResponse.builder().id(review.getId()).userName(user.getName())
            .rating(review.getRating()).title(review.getTitle()).comment(review.getComment())
            .isVerifiedPurchase(false).helpfulCount(0).createdAt(review.getCreatedAt()).build();
    }

    @Override
    @Transactional
    public void markHelpful(Long reviewId) {
        reviewRepository.findById(reviewId).ifPresent(r -> {
            r.setHelpfulCount(r.getHelpfulCount() + 1);
            reviewRepository.save(r);
        });
    }
}
