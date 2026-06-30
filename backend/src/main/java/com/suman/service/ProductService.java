package com.suman.service;
import com.suman.dto.request.ProductRequest;
import com.suman.dto.response.*;
import org.springframework.data.domain.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
public interface ProductService {
    Page<ProductResponse> getProducts(String category, String brand, BigDecimal minPrice, BigDecimal maxPrice,
        Double minRating, Boolean isFeatured, Boolean isTrending, String sortBy, Pageable pageable);
    ProductDetailResponse getProductBySlug(String slug);
    List<ProductResponse> getFeaturedProducts();
    List<ProductResponse> getTrendingProducts();
    List<ProductResponse> getRelatedProducts(Long productId);
    List<ProductResponse> getAIRecommendations(Long userId);
    ProductDetailResponse createProduct(ProductRequest request);
    ProductDetailResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    List<String> uploadImages(Long productId, List<MultipartFile> images);
}
