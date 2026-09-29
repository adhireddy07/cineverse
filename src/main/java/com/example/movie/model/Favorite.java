package com.example.movie.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long movieId;

    private String movieTitle;

    private String moviePoster;

    private String movieGenre;

    private Double movieRating;

    private LocalDateTime addedAt = LocalDateTime.now();

    public Favorite() {}

    public Favorite(Long userId, Long movieId, String movieTitle, String moviePoster, String movieGenre, Double movieRating) {
        this.userId = userId;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.moviePoster = moviePoster;
        this.movieGenre = movieGenre;
        this.movieRating = movieRating;
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

    public String getMovieGenre() { return movieGenre; }
    public void setMovieGenre(String movieGenre) { this.movieGenre = movieGenre; }

    public Double getMovieRating() { return movieRating; }
    public void setMovieRating(Double movieRating) { this.movieRating = movieRating; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
