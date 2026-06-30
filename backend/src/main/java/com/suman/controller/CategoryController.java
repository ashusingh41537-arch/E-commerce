package com.suman.controller;

import com.suman.dto.response.*;
import com.suman.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll() {
        List<CategoryResponse> cats = categoryRepository.findByIsActiveTrueOrderByNameAsc()
            .stream().map(c -> CategoryResponse.builder().id(c.getId()).name(c.getName()).slug(c.getSlug()).image(c.getImage()).build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(null, cats));
    }
}
