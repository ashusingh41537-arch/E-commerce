package com.suman.service;
import com.suman.dto.response.CouponResponse;
public interface CouponService {
    CouponResponse validateCoupon(String code, Double amount, String email);
}
