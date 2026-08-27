package com.arstore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final String issuer;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.expiration-ms}") long expirationMs,
                       @Value("${app.jwt.issuer}") String issuer) {
        // The secret must be at least 256 bits (32 bytes) for HS256.
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(bytes.length >= 32 ? bytes : pad(bytes));
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    private byte[] pad(byte[] bytes) {
        byte[] padded = new byte[32];
        System.arraycopy(bytes, 0, padded, 0, Math.min(bytes.length, 32));
        return padded;
    }

    public String generateToken(String username, String role, Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .issuer(issuer)
                .subject(username)
                .claims(Map.of("role", role, "userId", userId))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
