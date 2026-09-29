package com.example.movie.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "watch_progress")
public class WatchProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long movieId;

    private String movieTitle;

    private String moviePoster;

    private Integer progressPercent = 0;

    private LocalDateTime lastWatchedAt = LocalDateTime.now();

    public WatchProgress() {}

    public WatchProgress(Long userId, Long movieId, String movieTitle, String moviePoster, Integer progressPercent) {
        this.userId = userId;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.moviePoster = moviePoster;
        this.progressPercent = progressPercent;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public String getMoviePoster() { return moviePoster; }
    public void setMoviePoster(String moviePoster) { this.moviePoster = moviePoster; }

    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

    public LocalDateTime getLastWatchedAt() { return lastWatchedAt; }
    public void setLastWatchedAt(LocalDateTime lastWatchedAt) { this.lastWatchedAt = lastWatchedAt; }
}
