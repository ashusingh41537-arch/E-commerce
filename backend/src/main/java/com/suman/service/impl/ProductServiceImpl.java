package com.suman.service.impl;

import com.suman.dto.request.ProductRequest;
import com.suman.dto.response.*;
import com.suman.entity.Product;
import com.suman.repository.*;
import com.suman.service.CloudinaryService;
import com.suman.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final UserBehaviorRepository userBehaviorRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public Page<ProductResponse> getProducts(String category, String brand,
            BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
            Boolean isFeatured, Boolean isTrending, String sortBy, Pageable pageable) {

        Sort sort = buildSort(sortBy);
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Product> products = productRepository.findWithFilters(
            category, brand, minPrice, maxPrice,
            minRating != null ? BigDecimal.valueOf(minRating) : null,
            isFeatured, isTrending, sortedPageable);

        return products.map(this::toProductResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return toProductDetailResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository
            .findByIsFeaturedTrueAndIsActiveTrueOrderBySoldCountDesc()
            .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getTrendingProducts() {
        return productRepository
            .findByIsTrendingTrueAndIsActiveTrueOrderByReviewCountDesc()
            .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getCategory() == null) return Collections.emptyList();
        return productRepository
            .findByCategoryAndIdNot(product.getCategory().getId(), productId,
                PageRequest.of(0, 8))
            .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAIRecommendations(Long userId) {
        List<Long> categoryIds = userBehaviorRepository.findTopCategoriesByUser(userId);
        if (categoryIds.isEmpty()) {
            return productRepository.findTop8ByIsActiveTrueOrderByAverageRatingDesc()
                .stream().map(this::toProductResponse).collect(Collectors.toList());
        }
        return productRepository.findByCategories(categoryIds, PageRequest.of(0, 8))
            .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductDetailResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
            .name(request.getName())
            .slug(generateSlug(request.getName()))
            .description(request.getDescription())
            .shortDescription(request.getShortDescription())
            .price(request.getPrice())
            .comparePrice(request.getComparePrice())
            .sku(request.getSku())
            .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
            .category(request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId()).orElse(null) : null)
            .brand(request.getBrandId() != null
                ? brandRepository.findById(request.getBrandId()).orElse(null) : null)
            .isFeatured(Boolean.TRUE.equals(request.getIsFeatured()))
            .isTrending(Boolean.TRUE.equals(request.getIsTrending()))
            .tags(request.getTags())
            .isActive(true)
            .build();
        return toProductDetailResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDetailResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getShortDescription() != null)
            product.setShortDescription(request.getShortDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getComparePrice() != null) product.setComparePrice(request.getComparePrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getIsFeatured() != null) product.setIsFeatured(request.getIsFeatured());
        if (request.getIsTrending() != null) product.setIsTrending(request.getIsTrending());
        if (request.getTags() != null) product.setTags(request.getTags());
        if (request.getCategoryId() != null)
            product.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        if (request.getBrandId() != null)
            product.setBrand(brandRepository.findById(request.getBrandId()).orElse(null));
        return toProductDetailResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    public List<String> uploadImages(Long productId, List<MultipartFile> images) {
        productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        List<String> urls = new ArrayList<>();
        for (MultipartFile image : images) {
            String url = cloudinaryService.uploadImage(image, "products");
            urls.add(url);
        }
        return urls;
    }

    // ======================== MAPPING ========================

    private ProductResponse toProductResponse(Product product) {
        // Safe image access
        String primaryImage = null;
        try {
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                primaryImage = product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .map(img -> img.getImageUrl())
                    .orElse(product.getImages().get(0).getImageUrl());
            }
        } catch (Exception e) {
            primaryImage = null;
        }

        BigDecimal discountPercent = BigDecimal.ZERO;
        if (product.getComparePrice() != null
                && product.getComparePrice().compareTo(product.getPrice()) > 0) {
            discountPercent = product.getComparePrice()
                .subtract(product.getPrice())
                .divide(product.getComparePrice(), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        }

        return ProductResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .slug(product.getSlug())
            .shortDescription(product.getShortDescription())
            .price(product.getPrice())
            .comparePrice(product.getComparePrice())
            .stockQuantity(product.getStockQuantity())
            .primaryImage(primaryImage)
            .categoryName(product.getCategory() != null
                ? product.getCategory().getName() : null)
            .brandName(product.getBrand() != null
                ? product.getBrand().getName() : null)
            .averageRating(product.getAverageRating())
            .reviewCount(product.getReviewCount())
            .soldCount(product.getSoldCount())
            .isFeatured(product.getIsFeatured())
            .isTrending(product.getIsTrending())
            .discountPercent(discountPercent)
            .build();
    }

    private ProductDetailResponse toProductDetailResponse(Product product) {
        List<String> imageUrls = Collections.emptyList();
        try {
            if (product.getImages() != null) {
                imageUrls = product.getImages().stream()
                    .map(img -> img.getImageUrl())
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            imageUrls = Collections.emptyList();
        }

        List<VariantResponse> variants = Collections.emptyList();
        try {
            if (product.getVariants() != null) {
                variants = product.getVariants().stream()
                    .map(v -> VariantResponse.builder()
                        .id(v.getId()).size(v.getSize()).color(v.getColor())
                        .colorHex(v.getColorHex()).shade(v.getShade())
                        .additionalPrice(v.getAdditionalPrice())
                        .stockQuantity(v.getStockQuantity())
                        .imageUrl(v.getImageUrl()).build())
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            variants = Collections.emptyList();
        }

        return ProductDetailResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .slug(product.getSlug())
            .description(product.getDescription())
            .shortDescription(product.getShortDescription())
            .price(product.getPrice())
            .comparePrice(product.getComparePrice())
            .sku(product.getSku())
            .stockQuantity(product.getStockQuantity())
            .images(imageUrls)
            .variants(variants)
            .averageRating(product.getAverageRating())
            .reviewCount(product.getReviewCount())
            .soldCount(product.getSoldCount())
            .tags(product.getTags())
            .createdAt(product.getCreatedAt())
            .build();
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "")
            + "-" + System.currentTimeMillis();
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending();
        return switch (sortBy) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating"     -> Sort.by("averageRating").descending();
            case "popularity" -> Sort.by("soldCount").descending();
            default           -> Sort.by("createdAt").descending();
        };
    }
}
