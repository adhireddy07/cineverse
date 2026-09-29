package com.example.movie.controller;

import com.example.movie.dto.ReviewRequest;
import com.example.movie.model.Review;
import com.example.movie.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<Review>> getReviews() {
        return ResponseEntity.ok(reviewRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody ReviewRequest req) {
        if (req.getMovieName() == null || req.getMovieName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Movie name is required"));
        }
        Review review = new Review(
            req.getUserId(),
            req.getUserName() != null ? req.getUserName() : "Anonymous",
            req.getMovieName(),
            req.getRating() != null ? req.getRating() : 5,
            req.getReviewText()
        );
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully", "review", saved));
    }
}
