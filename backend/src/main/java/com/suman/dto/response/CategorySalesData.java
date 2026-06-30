package com.suman.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategorySalesData {
    private String category;
    private Long sales;
    private BigDecimal revenue;
}
