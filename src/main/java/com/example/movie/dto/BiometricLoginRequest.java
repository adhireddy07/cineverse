package com.example.movie.dto;

public class BiometricLoginRequest {
    private Long userId;
    private String email;
    private String dob;
    private String faceDescriptor;
    private String facePhotoUrl;

    public BiometricLoginRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getFaceDescriptor() { return faceDescriptor; }
    public void setFaceDescriptor(String faceDescriptor) { this.faceDescriptor = faceDescriptor; }

    public String getFacePhotoUrl() { return facePhotoUrl; }
    public void setFacePhotoUrl(String facePhotoUrl) { this.facePhotoUrl = facePhotoUrl; }
}
