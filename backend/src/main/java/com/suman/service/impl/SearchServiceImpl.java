package com.suman.service.impl;

import com.suman.dto.response.*;
import com.suman.entity.SearchHistory;
import com.suman.repository.*;
import com.suman.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ProductRepository productRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    @Override
    public SearchResponse search(String q, String category, Double minPrice, Double maxPrice, Double minRating, String brand) {
        // Save search for trending analytics
        SearchHistory history = SearchHistory.builder().searchTerm(q).build();
        searchHistoryRepository.save(history);

        var products = productRepository.searchProducts(q, PageRequest.of(0, 20))
            .stream().map(p -> ProductResponse.builder()
                .id(p.getId()).name(p.getName()).slug(p.getSlug())
                .price(p.getPrice()).comparePrice(p.getComparePrice())
                .averageRating(p.getAverageRating()).reviewCount(p.getReviewCount())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .stockQuantity(p.getStockQuantity())
                .build())
            .collect(Collectors.toList());

        return SearchResponse.builder()
            .products(products)
            .totalCount(products.size())
            .relatedSearches(getSuggestions(q).subList(0, Math.min(5, getSuggestions(q).size())))
            .build();
    }

    @Override
    public List<String> getSuggestions(String q) {
        List<String> fromProducts = productRepository.findSuggestions(q, PageRequest.of(0, 5))
            .stream().map(p -> p.getName()).collect(Collectors.toList());
        List<String> fromHistory = searchHistoryRepository.findSuggestions(q, PageRequest.of(0, 5));
        fromProducts.addAll(fromHistory);
        return fromProducts.stream().distinct().limit(8).collect(Collectors.toList());
    }

    @Override
    public List<String> getTrendingSearches() {
        return searchHistoryRepository.findTrendingSearches(PageRequest.of(0, 10));
    }
}
