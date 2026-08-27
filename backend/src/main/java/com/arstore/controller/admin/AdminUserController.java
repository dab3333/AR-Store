package com.arstore.controller.admin;

import com.arstore.dto.admin.DeleteUserRequest;
import com.arstore.dto.admin.UserResponse;
import com.arstore.security.UserPrincipal;
import com.arstore.service.admin.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<UserResponse> list() {
        return adminUserService.list();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable Long id,
                                        @Valid @RequestBody DeleteUserRequest request) {
        adminUserService.delete(id, principal.getId(), request.adminPassword());
        return ResponseEntity.noContent().build();
    }
}
