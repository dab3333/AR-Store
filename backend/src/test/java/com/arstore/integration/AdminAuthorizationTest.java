package com.arstore.integration;

import com.arstore.entity.Role;
import com.arstore.entity.User;
import com.arstore.repository.UserRepository;
import com.arstore.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminAuthorizationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;

    private String regularUserToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        User regular = new User();
        regular.setUsername("regularuser");
        regular.setEmail("regular@example.com");
        regular.setPasswordHash(passwordEncoder.encode("password123"));
        regular.setRole(Role.USER);
        regular.setVerified(true);
        regular = userRepository.save(regular);
        regularUserToken = jwtService.generateToken(regular.getUsername(), Role.USER.name(), regular.getId());

        User admin = new User();
        admin.setUsername("adminuser");
        admin.setEmail("admin@example.com");
        admin.setPasswordHash(passwordEncoder.encode("password123"));
        admin.setRole(Role.ADMIN);
        admin.setVerified(true);
        admin = userRepository.save(admin);
        adminToken = jwtService.generateToken(admin.getUsername(), Role.ADMIN.name(), admin.getId());
    }

    @Test
    void nonAdminUserGets403OnAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/collections")
                        .header("Authorization", "Bearer " + regularUserToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void requestWithNoTokenIsRejectedFromAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/collections"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void adminUserCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/collections")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
