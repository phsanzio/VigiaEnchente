package com.vigiaenchente.model.dto.request;

public record AddressRequest(
        String rua,
        String numero,
        String cep,
        String bairro,
        String cidade
) {}
