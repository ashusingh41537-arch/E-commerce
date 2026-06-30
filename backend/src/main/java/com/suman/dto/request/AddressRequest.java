package com.suman.dto.request;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class AddressRequest {
    private String name;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private Boolean isDefault;
    private String addressType;
}
