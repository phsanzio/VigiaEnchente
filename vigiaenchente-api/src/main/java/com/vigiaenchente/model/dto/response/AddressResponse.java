package com.vigiaenchente.model.dto.response;

public record AddressResponse(
        String rua,
        String numero,
        String cep,
        String bairro,
        String cidade
) {}
