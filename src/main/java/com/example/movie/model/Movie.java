package com.example.movie.model;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String genre;

    private String language;

    private Double rating;

    private Integer releaseYear;

    private String ageRating; // "U", "U/A", "A", "18+", "R"

    private Boolean isAdult = false;

    private Boolean isHorror = false;

    private String poster;

    @Column(length = 2000)
    private String overview;

    private String trailerUrl;

    private Boolean trending = false;

    public Movie() {}

    public Movie(String title, String genre, String language, Double rating, Integer releaseYear, String ageRating, String poster, String overview, Boolean isAdult, Boolean isHorror, Boolean trending) {
        this.title = title;
        this.genre = genre;
        this.language = language;
        this.rating = rating;
        this.releaseYear = releaseYear;
        this.ageRating = ageRating;
        this.poster = poster;
        this.overview = overview;
        this.isAdult = isAdult;
        this.isHorror = isHorror;
        this.trending = trending;
    }

    public Movie(String title, String genre, String language, Double rating, Integer releaseYear, String ageRating, String poster, String overview, String trailerUrl, Boolean isAdult, Boolean isHorror, Boolean trending) {
        this.title = title;
        this.genre = genre;
        this.language = language;
        this.rating = rating;
        this.releaseYear = releaseYear;
        this.ageRating = ageRating;
        this.poster = poster;
        this.overview = overview;
        this.trailerUrl = trailerUrl;
        this.isAdult = isAdult;
        this.isHorror = isHorror;
        this.trending = trending;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }

    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }

    public Boolean getIsAdult() { return isAdult; }
    public void setIsAdult(Boolean isAdult) { this.isAdult = isAdult; }

    public Boolean getIsHorror() { return isHorror; }
    public void setIsHorror(Boolean isHorror) { this.isHorror = isHorror; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public Boolean getTrending() { return trending; }
    public void setTrending(Boolean trending) { this.trending = trending; }
}
