package com.suman.repository;
import com.suman.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserEmail(String email);
    Optional<Address> findByIdAndUserEmail(Long id, String email);
}
