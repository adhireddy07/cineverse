package com.example.movie.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private boolean requiresBiometric = false;
    private Long userId;
    private String fullName;
    private String email;
    private String dob;
    private Integer age;
    private Boolean isAgeVerified;
    private Boolean isAdult;
    private String facePhotoUrl;
    private String token;

    public AuthResponse() {}

    public static AuthResponse fail(String message) {
        AuthResponse r = new AuthResponse();
        r.setSuccess(false);
        r.setMessage(message);
        return r;
    }

    public static AuthResponse biometricRequired(Long userId, String email, String message) {
        AuthResponse r = new AuthResponse();
        r.setSuccess(true);
        r.setRequiresBiometric(true);
        r.setUserId(userId);
        r.setEmail(email);
        r.setMessage(message);
        return r;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRequiresBiometric() { return requiresBiometric; }
    public void setRequiresBiometric(boolean requiresBiometric) { this.requiresBiometric = requiresBiometric; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Boolean getIsAgeVerified() { return isAgeVerified; }
    public void setIsAgeVerified(Boolean isAgeVerified) { this.isAgeVerified = isAgeVerified; }

    public Boolean getIsAdult() { return isAdult; }
    public void setIsAdult(Boolean isAdult) { this.isAdult = isAdult; }

    public String getFacePhotoUrl() { return facePhotoUrl; }
    public void setFacePhotoUrl(String facePhotoUrl) { this.facePhotoUrl = facePhotoUrl; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
