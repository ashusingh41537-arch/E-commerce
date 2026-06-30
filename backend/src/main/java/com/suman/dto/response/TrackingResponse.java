package com.suman.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TrackingResponse {
    private String status;
    private String message;
    private String location;
    private LocalDateTime createdAt;
}
