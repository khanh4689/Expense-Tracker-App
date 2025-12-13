package com.expensetracker.service.impl;

import com.expensetracker.dto.AuthDto;
import com.expensetracker.entity.EmailVerificationToken;
import com.expensetracker.entity.PasswordResetToken;
import com.expensetracker.entity.User;
import com.expensetracker.exception.CustomExceptions;
import com.expensetracker.repository.EmailVerificationTokenRepository;
import com.expensetracker.repository.PasswordResetTokenRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtUtil;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;
        private final EmailService emailService;
        private final EmailVerificationTokenRepository tokenRepository;
        private final PasswordResetTokenRepository passwordResetTokenRepository;

        @Override
        @Transactional
        public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
                // 1. Check if user exists
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new CustomExceptions.DuplicateResourceException("Username already exists");
                }
                // 1.1 Check if email exists
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new CustomExceptions.DuplicateResourceException("Email already exists");
                }

                // 2. Create user with enabled = false
                User user = User.builder()
                                .fullName(request.getFullName())
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .enabled(false) // Account disabled until email verification
                                .build();

                userRepository.save(user);

                // 3. Generate verification token
                String token = UUID.randomUUID().toString();
                EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                                .token(token)
                                .user(user)
                                .expiredAt(LocalDateTime.now().plusHours(24)) // Token expires in 24 hours
                                .build();
                tokenRepository.save(verificationToken);

                // 4. Send verification email
                emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), token);

                // 5. Return response WITHOUT token (no auto-login)
                return AuthDto.AuthResponse.builder()
                                .token(null)
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .enabled(user.isEnabled())
                                .build();
        }

        @Override
        public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
                // 1. Find user by username or email
                String identifier = request.getUsername() != null ? request.getUsername() : request.getEmail();
                User user = userRepository.findByUsername(identifier)
                                .or(() -> userRepository.findByEmail(identifier))
                                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Invalid credentials"));

                // 2. Check if account is enabled
                if (!user.isEnabled()) {
                        throw new CustomExceptions.AccountNotEnabledException(
                                        "Email not verified. Please check your email to verify your account.");
                }

                // 3. Authenticate
                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(user.getUsername(),
                                                        request.getPassword()));
                } catch (Exception e) {
                        throw new CustomExceptions.UnauthorizedException("Invalid credentials");
                }

                // 4. Generate Token
                String token = jwtUtil.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getUsername(),
                                user.getPassword(),
                                java.util.Collections
                                                .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_USER"))));

                return AuthDto.AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .enabled(user.isEnabled())
                                .build();
        }

        @Override
        public User getCurrentUser() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new CustomExceptions.UnauthorizedException("User is not authenticated");
                }
                String username = authentication.getName();
                return userRepository.findByUsername(username)
                                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        }

        @Override
        @Transactional
        public String verifyEmail(String token) {
                // 1. Find token
                EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                                .orElseThrow(() -> new CustomExceptions.InvalidTokenException(
                                                "Invalid verification token"));

                // 2. Check if token is expired
                if (verificationToken.getExpiredAt().isBefore(LocalDateTime.now())) {
                        throw new CustomExceptions.InvalidTokenException("Verification token has expired");
                }

                // 3. Enable user account
                User user = verificationToken.getUser();
                user.setEnabled(true);
                userRepository.save(user);

                // 4. Delete token (one-time use)
                tokenRepository.delete(verificationToken);

                return "Email verified successfully! You can now login.";
        }

        @Override
        @Transactional
        public String forgotPassword(String email) {
                // 1. Find user by email
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                                                "No account found with this email"));

                // 2. Check if account is enabled
                if (!user.isEnabled()) {
                        throw new CustomExceptions.AccountNotEnabledException(
                                        "Please verify your email first before resetting password");
                }

                // 3. Delete any existing password reset tokens for this user
                passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

                // 4. Generate password reset token
                String token = UUID.randomUUID().toString();
                PasswordResetToken resetToken = PasswordResetToken.builder()
                                .token(token)
                                .user(user)
                                .expiredAt(LocalDateTime.now().plusHours(1)) // Token expires in 1 hour
                                .used(false)
                                .build();
                passwordResetTokenRepository.save(resetToken);

                // 5. Send password reset email
                emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);

                return "Password reset link has been sent to your email";
        }

        @Override
        @Transactional
        public String resetPassword(String token, String newPassword) {
                // 1. Find token
                PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                                .orElseThrow(() -> new CustomExceptions.InvalidTokenException(
                                                "Invalid password reset token"));

                // 2. Check if token is expired
                if (resetToken.getExpiredAt().isBefore(LocalDateTime.now())) {
                        throw new CustomExceptions.InvalidTokenException("Password reset token has expired");
                }

                // 3. Check if token has been used
                if (resetToken.isUsed()) {
                        throw new CustomExceptions.InvalidTokenException(
                                        "Password reset token has already been used");
                }

                // 4. Update user password
                User user = resetToken.getUser();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                // 5. Mark token as used
                resetToken.setUsed(true);
                passwordResetTokenRepository.save(resetToken);

                return "Password has been reset successfully! You can now login with your new password.";
        }
}
