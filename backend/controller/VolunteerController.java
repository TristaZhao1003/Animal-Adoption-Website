package com.paws.backend.controller;

import com.paws.backend.model.User;
import com.paws.backend.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/volunteers")
public class VolunteerController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/apply")
    public ResponseEntity<?> applyForVolunteer(@RequestBody VolunteerApplicationDto application) {
        User user = null;

        // 1. 如果传了 userId，通过 ID 查找
        if (application.getUserId() != null) {
            user = userRepository.findById(application.getUserId()).orElse(null);
        }

        // 2. 如果没找到，尝试通过 email 查找
        if (user == null && application.getEmail() != null) {
            user = userRepository.findByEmail(application.getEmail()).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found. Please register first."));
        }

        // 3. 更新用户状态为志愿者
        user.setVolunteer(true);
        user.setVolunteerRole(application.getRole());
        user.setExperience(application.getExperience());
        user.setAvailability(application.getAvailability());
        user.setApplicationDate(LocalDateTime.now().toString());

        // 如果传了电话且用户没有电话，更新电话
        if (user.getPhone() == null && application.getPhone() != null) {
            user.setPhone(application.getPhone());
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
    }

    @Data
    static class VolunteerApplicationDto {
        private String userId;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String experience;
        private String availability;
    }
}