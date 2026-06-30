package com.suman.dto.request;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class ReviewRequest {
    private Long productId;
    private Long orderItemId;
    private Integer rating;
    private String title;
    private String comment;
}
