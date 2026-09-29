package com.example.movie.service;

import com.example.movie.dto.*;
import com.example.movie.model.User;
import com.example.movie.model.UserPreference;
import com.example.movie.repository.UserPreferenceRepository;
import com.example.movie.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPreferenceRepository preferenceRepository;

    @Autowired
    private BiometricService biometricService;

    public AuthResponse register(RegisterRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return AuthResponse.fail("Email is required.");
        }
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            return AuthResponse.fail("Email already registered. Please login.");
        }

        LocalDate dob = null;
        Integer age = null;
        if (req.getDob() != null && !req.getDob().trim().isEmpty()) {
            try {
                dob = LocalDate.parse(req.getDob().trim(), DateTimeFormatter.ISO_LOCAL_DATE);
                age = biometricService.calculateAge(dob);
            } catch (Exception e) {
                return AuthResponse.fail("Invalid Date of Birth format. Please use YYYY-MM-DD.");
            }
        } else {
            return AuthResponse.fail("Date of Birth is required for age verification.");
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPassword(hashPassword(req.getPassword()));
        user.setDob(dob);
        user.setAge(age);
        user.setIsAgeVerified(true);

        if (req.getFaceDescriptor() != null && !req.getFaceDescriptor().trim().isEmpty()) {
            user.setFaceDescriptor(req.getFaceDescriptor());
            user.setIsFaceEnrolled(true);
        }
        if (req.getFacePhotoUrl() != null && !req.getFacePhotoUrl().trim().isEmpty()) {
            user.setFacePhotoUrl(req.getFacePhotoUrl());
        }

        User saved = userRepository.save(user);

        // Seed initial preferences
        UserPreference pref = new UserPreference(saved.getId(), "Action,Sci-Fi,Drama");
        preferenceRepository.save(pref);

        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage("Registration successful with Face Biometric Enrollment!");
        resp.setUserId(saved.getId());
        resp.setFullName(saved.getFullName());
        resp.setEmail(saved.getEmail());
        resp.setDob(saved.getDob() != null ? saved.getDob().toString() : "");
        resp.setAge(saved.getAge());
        resp.setIsAgeVerified(saved.getIsAgeVerified());
        resp.setIsAdult(saved.getAge() != null && saved.getAge() >= 18);
        resp.setFacePhotoUrl(saved.getFacePhotoUrl());
        resp.setToken("token_" + saved.getId() + "_" + System.currentTimeMillis());
        return resp;
    }

    public AuthResponse loginStep1(LoginStep1Request req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return AuthResponse.fail("Email and password are required.");
        }

        Optional<User> opt = userRepository.findByEmail(req.getEmail().trim().toLowerCase());
        if (opt.isEmpty()) {
            return AuthResponse.fail("Invalid email or password.");
        }

        User user = opt.get();
        if (!user.getPassword().equals(hashPassword(req.getPassword()))) {
            return AuthResponse.fail("Invalid email or password.");
        }

        // Check if user has enrolled face and DOB
        if (user.getIsFaceEnrolled() != null && user.getIsFaceEnrolled()) {
            return AuthResponse.biometricRequired(user.getId(), user.getEmail(), "Password verified. Please complete Date of Birth & Face Verification.");
        }

        // If not enrolled in biometric yet (e.g. legacy/direct)
        return createSuccessAuthResponse(user, "Login successful!");
    }

    public AuthResponse verifyBiometricLogin(BiometricLoginRequest req) {
        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId()).orElse(null);
        } else if (req.getEmail() != null) {
            user = userRepository.findByEmail(req.getEmail().trim().toLowerCase()).orElse(null);
        }

        if (user == null) {
            return AuthResponse.fail("User not found.");
        }

        // 1. Verify Date of Birth
        boolean dobMatches = biometricService.verifyDob(user.getDob(), req.getDob());
        if (!dobMatches) {
            return AuthResponse.fail("Date of Birth does not match our records.");
        }

        // 2. Verify Face
        boolean faceMatches = biometricService.compareFaceDescriptors(user.getFaceDescriptor(), req.getFaceDescriptor());
        if (!faceMatches) {
            return AuthResponse.fail("Face verification failed. Facial biometrics do not match the account owner.");
        }

        // Success: update face snapshot if provided
        if (req.getFacePhotoUrl() != null && !req.getFacePhotoUrl().trim().isEmpty()) {
            user.setFacePhotoUrl(req.getFacePhotoUrl());
            userRepository.save(user);
        }

        return createSuccessAuthResponse(user, "Biometric Face & DOB Verification Successful! Welcome back.");
    }

    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return AuthResponse.fail("User not found");
        return createSuccessAuthResponse(user, "Profile loaded");
    }

    public void updatePreferences(PreferenceRequest req) {
        Optional<UserPreference> opt = preferenceRepository.findByUserId(req.getUserId());
        UserPreference pref = opt.orElse(new UserPreference(req.getUserId(), req.getGenres()));
        pref.setFavoriteGenres(req.getGenres());
        preferenceRepository.save(pref);
    }

    public String getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .map(UserPreference::getFavoriteGenres)
                .orElse("Action,Sci-Fi,Drama");
    }

    private AuthResponse createSuccessAuthResponse(User user, String msg) {
        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage(msg);
        resp.setRequiresBiometric(false);
        resp.setUserId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setDob(user.getDob() != null ? user.getDob().toString() : "");
        resp.setAge(user.getAge());
        resp.setIsAgeVerified(user.getIsAgeVerified());
        resp.setIsAdult(user.getAge() != null && user.getAge() >= 18);
        resp.setFacePhotoUrl(user.getFacePhotoUrl());
        resp.setToken("token_" + user.getId() + "_" + System.currentTimeMillis());
        return resp;
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return password;
        }
    }
}
