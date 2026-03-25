package com.vigiaenchente.service;

import com.vigiaenchente.exception.BusinessException;
import com.vigiaenchente.model.dto.request.AddressRequest;
import com.vigiaenchente.model.dto.request.LoginRequest;
import com.vigiaenchente.model.dto.request.UserRegisterRequest;
import com.vigiaenchente.model.dto.response.AddressResponse;
import com.vigiaenchente.model.dto.response.AuthResponse;
import com.vigiaenchente.model.dto.response.UserResponse;
import com.vigiaenchente.model.entity.Address;
import com.vigiaenchente.model.entity.User;
import com.vigiaenchente.model.enums.Role;
import com.vigiaenchente.repository.AddressRepository;
import com.vigiaenchente.repository.UserRepository;
import com.vigiaenchente.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail já cadastrado.", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByPhone(request.phone())) {
            throw new BusinessException("Telefone já cadastrado.", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .nome(request.nome())
                .email(request.email())
                .phone(request.phone())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, toResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado.", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.senha(), user.getSenhaHash())) {
            throw new BusinessException("Senha incorreta.", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, toResponse(user));
    }

    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado.", HttpStatus.NOT_FOUND));
        return toResponse(user);
    }

    @Transactional
    public AddressResponse saveAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado.", HttpStatus.NOT_FOUND));

        Address address = addressRepository.findByUserId(userId)
                .orElse(Address.builder().user(user).build());

        address.setRua(request.rua());
        address.setNumero(request.numero());
        address.setCep(request.cep());
        address.setBairro(request.bairro());
        address.setCidade(request.cidade());

        addressRepository.save(address);
        return toAddressResponse(address);
    }

    @Transactional
    public UserResponse promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado.", HttpStatus.NOT_FOUND));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        AddressResponse addr = user.getAddress() != null ? toAddressResponse(user.getAddress()) : null;
        return new UserResponse(user.getId(), user.getNome(), user.getEmail(), user.getPhone(), user.getRole().name(), addr);
    }

    private AddressResponse toAddressResponse(Address address) {
        return new AddressResponse(
                address.getRua(), address.getNumero(), address.getCep(),
                address.getBairro(), address.getCidade());
    }
}
