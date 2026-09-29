package com.example.movie.dto;

public class PreferenceRequest {
    private Long userId;
    private String genres;

    public PreferenceRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getGenres() { return genres; }
    public void setGenres(String genres) { this.genres = genres; }
}
