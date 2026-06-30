package com.suman.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserGrowthData {
    private String label;
    private Long newUsers;
    private Long totalUsers;
}
