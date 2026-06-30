package com.suman.dto.response;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String logo;
}
