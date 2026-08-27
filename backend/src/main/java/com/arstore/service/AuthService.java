package com.arstore.service;

import com.arstore.dto.*;
import com.arstore.entity.Cart;
import com.arstore.entity.PasswordResetToken;
import com.arstore.entity.Role;
import com.arstore.entity.User;
import com.arstore.exception.ApiException;
import com.arstore.repository.CartRepository;
import com.arstore.repository.PasswordResetTokenRepository;
import com.arstore.repository.UserRepository;
import com.arstore.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final long VERIFICATION_TOKEN_TTL_HOURS = 24;
    private static final long RESET_TOKEN_TTL_MINUTES = 60;

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RecaptchaService recaptchaService;
    private final MailService mailService;

    public AuthService(UserRepository userRepository,
                        CartRepository cartRepository,
                        PasswordResetTokenRepository resetTokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        RecaptchaService recaptchaService,
                        MailService mailService) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.recaptchaService = recaptchaService;
        this.mailService = mailService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (!recaptchaService.verify(request.recaptchaToken())) {
            throw ApiException.badRequest("reCAPTCHA verification failed");
        }
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw ApiException.conflict("Username is already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAddress(request.address());
        user.setContact(request.contact());
        user.setRole(Role.USER);
        user.setVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_TTL_HOURS));
        userRepository.save(user);

        Cart cart = new Cart();
        cart.setUser(user);
        cartRepository.save(cart);

        mailService.sendVerificationEmail(user.getEmail(), user.getUsername(), user.getEmail(), user.getVerificationToken());
    }

    @Transactional
    public void verify(String email, String token) {
        User user = userRepository.findByEmailIgnoreCaseAndVerificationToken(email, token)
                .orElseThrow(() -> ApiException.badRequest("Invalid verification link"));

        if (user.isVerified()) {
            return; // already verified, treat as idempotent success
        }
        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw ApiException.badRequest("Verification link has expired");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        if (!user.isVerified()) {
            throw ApiException.unauthorized("Please verify your email before logging in");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_TTL_MINUTES));
            resetToken.setUsed(false);
            resetTokenRepository.save(resetToken);
            mailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetToken.getToken());
        });
        // Always respond as if successful (no user enumeration) - handled by controller returning 200 regardless.
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw ApiException.badRequest("This reset link has already been used");
        }
        if (resetToken.getExpiry().isBefore(LocalDateTime.now())) {
            throw ApiException.badRequest("This reset link has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }
}
