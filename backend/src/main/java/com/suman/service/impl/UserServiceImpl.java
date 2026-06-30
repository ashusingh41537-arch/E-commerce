package com.suman.service.impl;

import com.suman.dto.request.*;
import com.suman.dto.response.*;
import com.suman.entity.*;
import com.suman.repository.*;
import com.suman.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.builder().id(user.getId()).name(user.getName()).email(user.getEmail())
            .phone(user.getPhone()).role(user.getRole().name()).profileImage(user.getProfileImage())
            .isActive(user.getIsActive()).createdAt(user.getCreatedAt()).build();
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        userRepository.save(user);
        return getProfile(email);
    }

    @Override
    public List<ProductResponse> getRecentlyViewed(String email) {
        return recentlyViewedRepository.findByUserEmailOrderByViewedAtDesc(email)
            .stream().limit(10).map(rv -> {
                Product p = rv.getProduct();
                String img = (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0).getImageUrl() : null;
                return ProductResponse.builder().id(p.getId()).name(p.getName()).slug(p.getSlug())
                    .price(p.getPrice()).primaryImage(img).build();
            }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserEmail(email).forEach(a -> { a.setIsDefault(false); addressRepository.save(a); });
        }
        Address address = Address.builder().user(user).name(request.getName()).phone(request.getPhone())
            .addressLine1(request.getAddressLine1()).addressLine2(request.getAddressLine2())
            .city(request.getCity()).state(request.getState()).pincode(request.getPincode())
            .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
            .addressType(request.getAddressType() != null ? request.getAddressType() : "HOME")
            .build();
        address = addressRepository.save(address);
        return AddressResponse.builder().id(address.getId()).name(address.getName()).phone(address.getPhone())
            .addressLine1(address.getAddressLine1()).city(address.getCity()).state(address.getState())
            .pincode(address.getPincode()).isDefault(address.getIsDefault()).addressType(address.getAddressType()).build();
    }

    @Override
    public List<AddressResponse> getAddresses(String email) {
        return addressRepository.findByUserEmail(email).stream().map(a ->
            AddressResponse.builder().id(a.getId()).name(a.getName()).phone(a.getPhone())
                .addressLine1(a.getAddressLine1()).addressLine2(a.getAddressLine2())
                .city(a.getCity()).state(a.getState()).pincode(a.getPincode())
                .country(a.getCountry()).isDefault(a.getIsDefault()).addressType(a.getAddressType()).build())
            .collect(Collectors.toList());
    }
}
