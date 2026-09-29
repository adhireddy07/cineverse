package com.example.movie.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private LocalDate dob;

    private Integer age;

    private String role = "USER";

    @Lob
    @Column(columnDefinition = "TEXT")
    private String faceDescriptor;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String facePhotoUrl;

    private Boolean isAgeVerified = false;

    private Boolean isFaceEnrolled = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String fullName, String email, String password, LocalDate dob, Integer age) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.dob = dob;
        this.age = age;
        this.isAgeVerified = (age != null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFaceDescriptor() { return faceDescriptor; }
    public void setFaceDescriptor(String faceDescriptor) { this.faceDescriptor = faceDescriptor; }

    public String getFacePhotoUrl() { return facePhotoUrl; }
    public void setFacePhotoUrl(String facePhotoUrl) { this.facePhotoUrl = facePhotoUrl; }

    public Boolean getIsAgeVerified() { return isAgeVerified; }
    public void setIsAgeVerified(Boolean isAgeVerified) { this.isAgeVerified = isAgeVerified; }

    public Boolean getIsFaceEnrolled() { return isFaceEnrolled; }
    public void setIsFaceEnrolled(Boolean isFaceEnrolled) { this.isFaceEnrolled = isFaceEnrolled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
