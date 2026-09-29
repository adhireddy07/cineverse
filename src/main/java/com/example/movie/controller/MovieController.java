package com.example.movie.controller;

import com.example.movie.model.Movie;
import com.example.movie.service.MovieService;
import com.example.movie.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/trending")
    public ResponseEntity<List<Movie>> getTrending(@RequestParam(required = false, defaultValue = "false") boolean isUnder18) {
        return ResponseEntity.ok(movieService.getTrending(isUnder18));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Movie>> search(@RequestParam String q, @RequestParam(required = false, defaultValue = "false") boolean isUnder18) {
        return ResponseEntity.ok(movieService.searchMovies(q, isUnder18));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id, @RequestParam(required = false, defaultValue = "false") boolean isUnder18) {
        Optional<Movie> opt = movieService.getMovieById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Movie movie = opt.get();

        // Strict Under-18 Content Protection Filter
        if (isUnder18) {
            boolean isRestricted = Boolean.TRUE.equals(movie.getIsAdult()) ||
                                   Boolean.TRUE.equals(movie.getIsHorror()) ||
                                   (movie.getGenre() != null && movie.getGenre().toLowerCase().contains("horror")) ||
                                   (movie.getAgeRating() != null && (
                                       movie.getAgeRating().contains("18+") ||
                                       movie.getAgeRating().equalsIgnoreCase("A") ||
                                       movie.getAgeRating().toUpperCase().contains("A / 18+") ||
                                       movie.getAgeRating().equalsIgnoreCase("R") ||
                                       movie.getAgeRating().toUpperCase().contains("R / 18+")
                                   ));

            if (isRestricted) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "restricted", true,
                    "title", movie.getTitle(),
                    "ageRating", movie.getAgeRating() != null ? movie.getAgeRating() : "18+",
                    "message", "Age Restricted Content: This movie is restricted for users under 18 years old."
                ));
            }
        }

        return ResponseEntity.ok(movie);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Movie>> getRecommendations(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean isUnder18) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, isUnder18));
    }

}
