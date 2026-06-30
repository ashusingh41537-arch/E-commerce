package com.suman.service;
import com.suman.dto.request.ReviewRequest;
import com.suman.dto.response.ReviewResponse;
import java.util.List;
public interface ReviewService {
    List<ReviewResponse> getProductReviews(Long productId);
    ReviewResponse addReview(String email, ReviewRequest request);
    void markHelpful(Long reviewId);
}
