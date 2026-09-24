package com.example.ums.service;

import com.example.ums.dto.CreateUserRequest;
import com.example.ums.dto.UserResponse;
import com.example.ums.entity.Role;
import com.example.ums.entity.User;
import com.example.ums.exception.DuplicateResourceException;
import com.example.ums.exception.ResourceNotFoundException;
import com.example.ums.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Email is already registered: " + normalizedEmail);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Admin-created user must always have role = USER in V1
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public void deleteUser(Long id, String authenticatedAdminEmail) {
        if (id == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Protection against deleting currently authenticated administrator
        if (userToDelete.getEmail().equalsIgnoreCase(authenticatedAdminEmail)) {
            throw new IllegalArgumentException("Cannot delete the currently authenticated administrator account");
        }

        userRepository.delete(userToDelete);
    }
}
