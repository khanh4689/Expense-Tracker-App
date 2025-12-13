package com.expensetracker.service;

public interface EmailService {
    void sendVerificationEmail(String toEmail, String username, String token);

    void sendPasswordResetEmail(String toEmail, String username, String token);
}
