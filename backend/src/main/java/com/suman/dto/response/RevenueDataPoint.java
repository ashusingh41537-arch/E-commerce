package com.suman.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RevenueDataPoint {
    private String label;
    private BigDecimal revenue;
    private Long orders;
}
