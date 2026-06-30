package com.suman.service;
import com.suman.dto.request.*;
import com.suman.dto.response.*;
import java.util.List;
public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    List<ProductResponse> getRecentlyViewed(String email);
    AddressResponse addAddress(String email, AddressRequest request);
    List<AddressResponse> getAddresses(String email);
}
