package com.vigiaenchente.model.dto.response;

/**
 * Resposta de autenticação contendo o token JWT e dados do usuário.
 */
public record AuthResponse(
        String token,
        UserResponse user
) {}
