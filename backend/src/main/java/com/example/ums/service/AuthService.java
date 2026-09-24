package com.example.ums.service;

import com.example.ums.dto.LoginRequest;
import com.example.ums.dto.LoginResponse;
import com.example.ums.dto.RegisterRequest;
import com.example.ums.dto.UserResponse;
import com.example.ums.entity.Role;
import com.example.ums.entity.User;
import com.example.ums.exception.DuplicateResourceException;
import com.example.ums.exception.UnauthorizedException;
import com.example.ums.repository.UserRepository;
import com.example.ums.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Email is already registered: " + normalizedEmail);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Public registration always assigns USER role
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, UserResponse.fromEntity(user));
    }
}
