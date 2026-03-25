package com.vigiaenchente.model.dto.response;

public record UserResponse(
        Long id,
        String nome,
        String email,
        String phone,
        String role,
        AddressResponse endereco
) {}
