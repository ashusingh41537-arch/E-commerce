package com.suman.repository;
import com.suman.entity.CartItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserEmail(String email);
    Optional<CartItem> findByUserEmailAndProductIdAndVariantId(String email, Long productId, Long variantId);
    void deleteByUserEmail(String email);
}
