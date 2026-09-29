package com.example.movie.repository;

import com.example.movie.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByTrendingTrue();

    @Query("SELECT m FROM Movie m WHERE m.trending = true AND m.isAdult = false AND m.isHorror = false AND (m.ageRating = 'U' OR m.ageRating = 'U/A' OR m.ageRating = 'PG' OR m.ageRating = 'PG-13' OR m.ageRating = 'G' OR m.ageRating IS NULL)")
    List<Movie> findTrendingSafeForUnder18();

    @Query("SELECT m FROM Movie m WHERE (LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Movie> searchMovies(@Param("q") String q);

    @Query("SELECT m FROM Movie m WHERE (LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :q, '%'))) AND m.isAdult = false AND m.isHorror = false AND (m.ageRating = 'U' OR m.ageRating = 'U/A' OR m.ageRating = 'PG' OR m.ageRating = 'PG-13' OR m.ageRating = 'G' OR m.ageRating IS NULL)")
    List<Movie> searchMoviesSafeForUnder18(@Param("q") String q);

    @Query("SELECT m FROM Movie m WHERE m.isAdult = false AND m.isHorror = false AND (m.ageRating = 'U' OR m.ageRating = 'U/A' OR m.ageRating = 'PG' OR m.ageRating = 'PG-13' OR m.ageRating = 'G' OR m.ageRating IS NULL)")
    List<Movie> findAllSafeForUnder18();

    List<Movie> findByIsAdultFalseAndIsHorrorFalse();

    java.util.Optional<Movie> findByTitle(String title);
}
