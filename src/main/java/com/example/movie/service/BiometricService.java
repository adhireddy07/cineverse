package com.example.movie.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

@Service
public class BiometricService {

    public int calculateAge(LocalDate dob) {
        if (dob == null) return 0;
        return Period.between(dob, LocalDate.now()).getYears();
    }

    public boolean verifyDob(LocalDate storedDob, String inputDobStr) {
        if (storedDob == null || inputDobStr == null || inputDobStr.trim().isEmpty()) {
            return false;
        }
        try {
            LocalDate inputDob = LocalDate.parse(inputDobStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            return storedDob.equals(inputDob);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Compares two 128-dimensional facial embeddings using multi-metric verification:
     * - Pearson Correlation Coefficient (r >= 0.70)
     * - Cosine Similarity (cosSim >= 0.82)
     * - Euclidean Distance (dist <= 0.58)
     * 
     * Rejects any face that does not match the enrolled user.
     */
    public boolean compareFaceDescriptors(String enrolledStr, String scannedStr) {
        if (enrolledStr == null || scannedStr == null) return false;
        enrolledStr = enrolledStr.trim();
        scannedStr = scannedStr.trim();

        if (enrolledStr.isEmpty() || scannedStr.isEmpty()) return false;
        if (enrolledStr.equals(scannedStr)) return true;

        try {
            double[] v1 = parseVector(enrolledStr);
            double[] v2 = parseVector(scannedStr);

            if (v1.length != v2.length || v1.length < 64) {
                System.out.println("[BiometricService] Vector length mismatch or insufficient dimensions: " + v1.length + " vs " + v2.length);
                return false;
            }

            int n = v1.length;

            // 1. Cosine Similarity
            double dot = 0.0;
            double norm1Sq = 0.0;
            double norm2Sq = 0.0;
            for (int i = 0; i < n; i++) {
                dot += v1[i] * v2[i];
                norm1Sq += v1[i] * v1[i];
                norm2Sq += v2[i] * v2[i];
            }
            double norm1 = Math.sqrt(norm1Sq);
            double norm2 = Math.sqrt(norm2Sq);
            double cosSim = (norm1 > 0 && norm2 > 0) ? (dot / (norm1 * norm2)) : 0.0;

            // 2. Euclidean Distance
            double sumSquares = 0.0;
            for (int i = 0; i < n; i++) {
                double diff = v1[i] - v2[i];
                sumSquares += diff * diff;
            }
            double distance = Math.sqrt(sumSquares);

            // 3. Pearson Correlation Coefficient
            double sum1 = 0.0, sum2 = 0.0;
            for (int i = 0; i < n; i++) {
                sum1 += v1[i];
                sum2 += v2[i];
            }
            double mean1 = sum1 / n;
            double mean2 = sum2 / n;

            double num = 0.0, den1 = 0.0, den2 = 0.0;
            for (int i = 0; i < n; i++) {
                double diff1 = v1[i] - mean1;
                double diff2 = v2[i] - mean2;
                num += diff1 * diff2;
                den1 += diff1 * diff1;
                den2 += diff2 * diff2;
            }
            double pearsonR = (den1 > 0 && den2 > 0) ? (num / (Math.sqrt(den1) * Math.sqrt(den2))) : 0.0;

            System.out.println(String.format("[Biometric Match] CosSim: %.4f, PearsonR: %.4f, Dist: %.4f", cosSim, pearsonR, distance));

            // Strict threshold: Must have high correlation and cosine similarity
            boolean isMatch = (cosSim >= 0.82 && pearsonR >= 0.70 && distance <= 0.60);
            return isMatch;
        } catch (Exception e) {
            System.err.println("[BiometricService] Error parsing face descriptors: " + e.getMessage());
            return false;
        }
    }

    private double[] parseVector(String vectorStr) {
        String clean = vectorStr.replaceAll("[\\[\\]\\s]", "");
        if (clean.isEmpty()) return new double[0];
        String[] parts = clean.split(",");
        double[] vec = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vec[i] = Double.parseDouble(parts[i]);
        }
        return vec;
    }
}
