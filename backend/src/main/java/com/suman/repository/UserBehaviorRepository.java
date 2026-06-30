package com.suman.repository;

import com.suman.entity.UserBehavior;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserBehaviorRepository extends JpaRepository<UserBehavior, Long> {

    @Query("SELECT p.category.id FROM UserBehavior ub " +
           "JOIN Product p ON ub.product.id = p.id " +
           "WHERE ub.user.id = :userId " +
           "GROUP BY p.category.id ORDER BY COUNT(ub) DESC")
    List<Long> findTopCategoriesByUser(@Param("userId") Long userId, Pageable pageable);

    default List<Long> findTopCategoriesByUser(Long userId) {
        return findTopCategoriesByUser(userId, PageRequest.of(0, 3));
    }
}
