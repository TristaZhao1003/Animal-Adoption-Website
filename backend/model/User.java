package com.paws.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String fullName;

    @Indexed(unique = true)
    private String email;
    private String password;
    private String phone;
    private String role = "USER"; // USER, ADMIN

    // 志愿者相关字段
    private boolean isVolunteer = false;
    private String volunteerRole;
    private String experience;
    private String availability;
    private String applicationDate;
}