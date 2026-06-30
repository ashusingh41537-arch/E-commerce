package com.suman.service;
import com.suman.dto.response.SearchResponse;
import java.util.List;
public interface SearchService {
    SearchResponse search(String q, String category, Double minPrice, Double maxPrice, Double minRating, String brand);
    List<String> getSuggestions(String q);
    List<String> getTrendingSearches();
}
