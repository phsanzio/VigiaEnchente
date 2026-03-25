package com.vigiaenchente.controller;

import com.vigiaenchente.model.dto.request.LoginRequest;
import com.vigiaenchente.model.dto.request.UserRegisterRequest;
import com.vigiaenchente.model.dto.response.AuthResponse;
import com.vigiaenchente.model.dto.response.UserResponse;
import com.vigiaenchente.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    /**
     * Promove um usuário a ADMIN. Apenas ADMINs podem executar.
     */
    @PatchMapping("/promote/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> promoteToAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.promoteToAdmin(userId));
    }
}
