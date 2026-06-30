package com.suman.dto.request;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class VerifyOtpRequest {
    private String email;
    private String otp;
}
