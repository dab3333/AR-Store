package com.arstore.service.admin;

import com.arstore.dto.admin.UserResponse;
import com.arstore.entity.Role;
import com.arstore.entity.User;
import com.arstore.exception.ApiException;
import com.arstore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    /**
     * Deletes a user after re-verifying the REQUESTING admin's own current
     * password (defense in depth against a hijacked/forgotten session).
     * Refuses to delete any account with role=ADMIN.
     */
    @Transactional
    public void delete(Long targetUserId, Long requestingAdminId, String requestingAdminPassword) {
        User admin = userRepository.findById(requestingAdminId)
                .orElseThrow(() -> ApiException.unauthorized("Requesting admin not found"));
        if (!passwordEncoder.matches(requestingAdminPassword, admin.getPasswordHash())) {
            throw ApiException.unauthorized("Incorrect admin password");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> ApiException.notFound("User not found: " + targetUserId));
        if (target.getRole() == Role.ADMIN) {
            throw ApiException.badRequest("Cannot delete an administrator account");
        }

        userRepository.delete(target);
    }
}
