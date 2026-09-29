package com.example.movie.dto;

public class WatchProgressRequest {
    private Long userId;
    private Long movieId;
    private String movieTitle;
    private String moviePoster;
    private Integer progressPercent;

    public WatchProgressRequest() {}

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
}
