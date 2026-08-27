package com.arstore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final String from;
    private final String frontendBaseUrl;

    public MailService(JavaMailSender mailSender,
                        @Value("${app.mail.from}") String from,
                        @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendVerificationEmail(String toEmail, String username, String email, String token) {
        String link = frontendBaseUrl + "/verify?email=" + encode(email) + "&token=" + encode(token);
        String body = "Hi " + username + ",\n\n"
                + "Welcome to AR Store! Please verify your email address by visiting the link below:\n\n"
                + link + "\n\n"
                + "If you did not create this account, you can ignore this email.";
        send(toEmail, "Verify your AR Store account", body);
    }

    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + encode(token);
        String body = "Hi " + username + ",\n\n"
                + "We received a request to reset your AR Store password. Click the link below to choose a new one:\n\n"
                + link + "\n\n"
                + "This link will expire soon. If you did not request a password reset, you can ignore this email.";
        send(toEmail, "Reset your AR Store password", body);
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            // Do not fail the calling request just because SMTP is unreachable
            // in local/dev environments; log loudly instead.
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
