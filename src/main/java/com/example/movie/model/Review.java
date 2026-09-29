package com.example.movie.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userName;

    @Column(nullable = false)
    private String movieName;

    private Integer rating; // 1 to 5

    @Column(length = 1000)
    private String reviewText;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}

    public Review(Long userId, String userName, String movieName, Integer rating, String reviewText) {
        this.userId = userId;
        this.userName = userName;
        this.movieName = movieName;
        this.rating = rating;
        this.reviewText = reviewText;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getMovieName() { return movieName; }
    public void setMovieName(String movieName) { this.movieName = movieName; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
