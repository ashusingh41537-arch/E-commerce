package com.suman.service.impl;

import com.suman.dto.response.CouponResponse;
import com.suman.entity.Coupon;
import com.suman.repository.CouponRepository;
import com.suman.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponResponse validateCoupon(String code, Double amount, String email) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
            .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Coupon has expired");

        BigDecimal orderAmount = BigDecimal.valueOf(amount);
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0)
            throw new RuntimeException("Minimum order amount is ₹" + coupon.getMinOrderAmount());

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit())
            throw new RuntimeException("Coupon usage limit reached");

        BigDecimal discount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (coupon.getMaxDiscountAmount() != null) discount = discount.min(coupon.getMaxDiscountAmount());
        } else {
            discount = coupon.getDiscountValue();
        }

        return CouponResponse.builder().id(coupon.getId()).code(coupon.getCode())
            .description(coupon.getDescription()).discountType(coupon.getDiscountType().name())
            .discountValue(coupon.getDiscountValue()).discountAmount(discount)
            .minOrderAmount(coupon.getMinOrderAmount()).isValid(true).build();
    }
}
