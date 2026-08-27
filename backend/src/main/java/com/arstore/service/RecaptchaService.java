package com.arstore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Verifies a Google reCAPTCHA v2 token server-side via the siteverify
 * endpoint. This is a real precondition for registration: a missing or
 * failed verification rejects the registration request before any user
 * row is created.
 */
@Service
public class RecaptchaService {

    private static final Logger log = LoggerFactory.getLogger(RecaptchaService.class);

    private final RestTemplate restTemplate;
    private final String secretKey;
    private final String verifyUrl;
    private final boolean enabled;

    public RecaptchaService(RestTemplate restTemplate,
                             @Value("${app.recaptcha.secret-key}") String secretKey,
                             @Value("${app.recaptcha.verify-url}") String verifyUrl,
                             @Value("${app.recaptcha.enabled:true}") boolean enabled) {
        this.restTemplate = restTemplate;
        this.secretKey = secretKey;
        this.verifyUrl = verifyUrl;
        this.enabled = enabled;
    }

    public boolean verify(String token) {
        if (!enabled) {
            // Escape hatch for local development only; controlled via
            // RECAPTCHA_ENABLED and defaults to true everywhere else.
            return true;
        }
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("secret", secretKey);
            form.add("response", token);

            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(verifyUrl, form, Map.class);
            if (result == null) {
                return false;
            }
            Object success = result.get("success");
            return Boolean.TRUE.equals(success);
        } catch (RestClientException ex) {
            log.warn("reCAPTCHA verification call failed: {}", ex.getMessage());
            return false;
        }
    }
}
