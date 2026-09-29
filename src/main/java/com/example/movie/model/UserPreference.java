package com.example.movie.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private String favoriteGenres; // Comma separated e.g. "Action,Sci-Fi,Comedy"

    public UserPreference() {}

    public UserPreference(Long userId, String favoriteGenres) {
        this.userId = userId;
        this.favoriteGenres = favoriteGenres;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFavoriteGenres() { return favoriteGenres; }
    public void setFavoriteGenres(String favoriteGenres) { this.favoriteGenres = favoriteGenres; }
}
