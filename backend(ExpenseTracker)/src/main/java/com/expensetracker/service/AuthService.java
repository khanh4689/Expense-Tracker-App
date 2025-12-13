package com.expensetracker.service;

import com.expensetracker.dto.AuthDto;
import com.expensetracker.entity.User;

public interface AuthService {
    AuthDto.AuthResponse register(AuthDto.RegisterRequest request);

    AuthDto.AuthResponse login(AuthDto.LoginRequest request);

    User getCurrentUser();

    String verifyEmail(String token);

    String forgotPassword(String email);

    String resetPassword(String token, String newPassword);
}

// Separate file would be better but for brevity in tool call, creating separate
// files
// actually I'll create separate files as per requirements.
