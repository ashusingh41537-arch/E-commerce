package com.suman.dto.request;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String profileImage;
}
