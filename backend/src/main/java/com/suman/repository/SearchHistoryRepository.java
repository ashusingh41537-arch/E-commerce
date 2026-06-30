package com.suman.repository;
import com.suman.entity.SearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    @Query("SELECT sh.searchTerm FROM SearchHistory sh GROUP BY sh.searchTerm ORDER BY COUNT(sh) DESC")
    List<String> findTrendingSearches(Pageable pageable);
    @Query("SELECT DISTINCT sh.searchTerm FROM SearchHistory sh WHERE LOWER(sh.searchTerm) LIKE LOWER(CONCAT(:term, '%'))")
    List<String> findSuggestions(@Param("term") String term, Pageable pageable);
}
