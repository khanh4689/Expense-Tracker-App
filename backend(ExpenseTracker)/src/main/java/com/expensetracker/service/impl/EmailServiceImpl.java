package com.expensetracker.service.impl;

import com.expensetracker.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String toEmail, String username, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Email Verification - Expense Tracker");

            String verificationLink = "http://localhost:8080/api/auth/verify?token=" + token;

            String htmlContent = buildVerificationEmail(username, verificationLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - Expense Tracker");

            String resetLink = "http://localhost:5173/reset-password?token=" + token;

            String htmlContent = buildPasswordResetEmail(username, resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildVerificationEmail(String username, String verificationLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "</head>" +
                "<body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\">" +
                "<div style=\"max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\">"
                +
                "<h2 style=\"color: #333333; text-align: center;\">Welcome to Expense Tracker!</h2>" +
                "<p style=\"color: #555555; font-size: 16px; line-height: 1.6;\">Hi <strong>" + username
                + "</strong>,</p>" +
                "<p style=\"color: #555555; font-size: 16px; line-height: 1.6;\">Thank you for registering with Expense Tracker. Please verify your email address by clicking the button below:</p>"
                +
                "<div style=\"text-align: center; margin: 30px 0;\">" +
                "<a href=\"" + verificationLink
                + "\" style=\"display: inline-block; background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;\">Verify Email</a>"
                +
                "</div>" +
                "<p style=\"color: #555555; font-size: 14px; line-height: 1.6;\">If the button doesn't work, copy and paste this link into your browser:</p>"
                +
                "<p style=\"color: #007BFF; font-size: 14px; word-break: break-all;\">" + verificationLink + "</p>" +
                "<hr style=\"border: none; border-top: 1px solid #eeeeee; margin: 30px 0;\">" +
                "<p style=\"color: #999999; font-size: 12px; text-align: center;\">If you didn't create an account, please ignore this email.</p>"
                +
                "<p style=\"color: #999999; font-size: 12px; text-align: center;\">&copy; 2025 Expense Tracker. All rights reserved.</p>"
                +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildPasswordResetEmail(String username, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "</head>" +
                "<body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\">" +
                "<div style=\"max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\">"
                +
                "<h2 style=\"color: #333333; text-align: center;\">Password Reset Request</h2>" +
                "<p style=\"color: #555555; font-size: 16px; line-height: 1.6;\">Hi <strong>" + username
                + "</strong>,</p>" +
                "<p style=\"color: #555555; font-size: 16px; line-height: 1.6;\">We received a request to reset your password. Click the button below to reset it:</p>"
                +
                "<div style=\"text-align: center; margin: 30px 0;\">" +
                "<a href=\"" + resetLink
                + "\" style=\"display: inline-block; background-color: #FF5722; color: white; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;\">Reset Password</a>"
                +
                "</div>" +
                "<p style=\"color: #555555; font-size: 14px; line-height: 1.6;\">If the button doesn't work, copy and paste this link into your browser:</p>"
                +
                "<p style=\"color: #007BFF; font-size: 14px; word-break: break-all;\">" + resetLink + "</p>" +
                "<p style=\"color: #FF5722; font-size: 14px; line-height: 1.6;\"><strong>Note:</strong> This link will expire in 1 hour.</p>"
                +
                "<hr style=\"border: none; border-top: 1px solid #eeeeee; margin: 30px 0;\">" +
                "<p style=\"color: #999999; font-size: 12px; text-align: center;\">If you didn't request a password reset, please ignore this email.</p>"
                +
                "<p style=\"color: #999999; font-size: 12px; text-align: center;\">&copy; 2025 Expense Tracker. All rights reserved.</p>"
                +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
