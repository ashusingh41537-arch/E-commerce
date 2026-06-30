package com.suman.dto.response;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SearchResponse {
    private List<ProductResponse> products;
    private Integer totalCount;
    private List<String> relatedSearches;
}
