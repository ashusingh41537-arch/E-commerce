package com.suman.repository;

import com.suman.entity.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.*;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.brand " +
           "WHERE p.slug = :slug")
    Optional<Product> findBySlug(@Param("slug") String slug);

    @Query(value = "SELECT p FROM Product p LEFT JOIN p.category c LEFT JOIN p.brand b " +
           "WHERE p.isActive = true " +
           "AND (:category IS NULL OR c.slug = :category) " +
           "AND (:brand IS NULL OR b.slug = :brand) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.averageRating >= :minRating) " +
           "AND (:isFeatured IS NULL OR p.isFeatured = :isFeatured) " +
           "AND (:isTrending IS NULL OR p.isTrending = :isTrending)",
           countQuery = "SELECT COUNT(p) FROM Product p LEFT JOIN p.category c LEFT JOIN p.brand b " +
           "WHERE p.isActive = true " +
           "AND (:category IS NULL OR c.slug = :category) " +
           "AND (:brand IS NULL OR b.slug = :brand) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.averageRating >= :minRating) " +
           "AND (:isFeatured IS NULL OR p.isFeatured = :isFeatured) " +
           "AND (:isTrending IS NULL OR p.isTrending = :isTrending)")
    Page<Product> findWithFilters(
        @Param("category") String category,
        @Param("brand") String brand,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") BigDecimal minRating,
        @Param("isFeatured") Boolean isFeatured,
        @Param("isTrending") Boolean isTrending,
        Pageable pageable);

    // Featured - with images eagerly loaded
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.brand " +
           "WHERE p.isFeatured = true AND p.isActive = true " +
           "ORDER BY p.soldCount DESC")
    List<Product> findByIsFeaturedTrueAndIsActiveTrueOrderBySoldCountDesc();

    // Trending - with images eagerly loaded
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.brand " +
           "WHERE p.isTrending = true AND p.isActive = true " +
           "ORDER BY p.reviewCount DESC")
    List<Product> findByIsTrendingTrueAndIsActiveTrueOrderByReviewCountDesc();

    // Top rated - with images
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.isActive = true " +
           "ORDER BY p.averageRating DESC")
    List<Product> findTop8ByIsActiveTrueOrderByAverageRatingDesc();

    @Query("SELECT p FROM Product p WHERE p.category.id = :catId " +
           "AND p.id != :productId AND p.isActive = true")
    List<Product> findByCategoryAndIdNot(
        @Param("catId") Long catId,
        @Param("productId") Long productId,
        Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.category.id IN :categoryIds AND p.isActive = true " +
           "ORDER BY p.averageRating DESC")
    List<Product> findByCategories(
        @Param("categoryIds") List<Long> categoryIds,
        Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<Product> searchProducts(@Param("term") String term, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "ORDER BY p.soldCount DESC")
    List<Product> findSuggestions(@Param("term") String term, Pageable pageable);
}
