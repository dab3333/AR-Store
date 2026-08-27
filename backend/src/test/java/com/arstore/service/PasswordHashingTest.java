package com.arstore.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordHashingTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void hashingProducesADifferentStringThanThePlaintext() {
        String raw = "S3curePassword!";
        String hash = encoder.encode(raw);
        assertNotEquals(raw, hash);
    }

    @Test
    void matchesReturnsTrueForTheCorrectPassword() {
        String raw = "S3curePassword!";
        String hash = encoder.encode(raw);
        assertTrue(encoder.matches(raw, hash));
    }

    @Test
    void matchesReturnsFalseForAnIncorrectPassword() {
        String hash = encoder.encode("S3curePassword!");
        assertFalse(encoder.matches("WrongPassword!", hash));
    }

    @Test
    void twoHashesOfTheSamePasswordAreNotIdentical() {
        String raw = "S3curePassword!";
        // BCrypt salts each hash independently.
        assertNotEquals(encoder.encode(raw), encoder.encode(raw));
    }
}
