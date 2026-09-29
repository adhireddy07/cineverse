package com.example.movie.service;

import com.example.movie.model.Movie;
import com.example.movie.model.User;
import com.example.movie.repository.MovieRepository;
import com.example.movie.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    /**
     * Content-based recommendation algorithm:
     * 1. Check user age: if under 18, strictly exclude all adult & horror movies!
     * 2. Match against user's preferred genres.
     * 3. Rank by genre affinity score + rating.
     */
    public List<Movie> getRecommendations(Long userId, boolean isUnder18Param) {
        boolean isUnder18 = isUnder18Param;
        Set<String> preferredGenres = new HashSet<>(Arrays.asList("Action", "Sci-Fi", "Drama"));

        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getAge() != null && user.getAge() < 18) {
                    isUnder18 = true;
                }
            }

            String genresStr = authService.getUserPreferences(userId);
            if (genresStr != null && !genresStr.trim().isEmpty()) {
                preferredGenres = Arrays.stream(genresStr.split(","))
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .collect(Collectors.toSet());
            }
        }

        // Fetch candidate catalog
        List<Movie> candidates;
        if (isUnder18) {
            candidates = movieRepository.findAllSafeForUnder18();
        } else {
            candidates = movieRepository.findAll();
        }


        final Set<String> finalPreferredGenres = preferredGenres;
        final boolean finalIsUnder18 = isUnder18;

        // Score and sort candidates
        return candidates.stream()
                // Strict secondary safety filter for under-18
                .filter(m -> {
                    if (finalIsUnder18) {
                        if (Boolean.TRUE.equals(m.getIsAdult()) || Boolean.TRUE.equals(m.getIsHorror())) {
                            return false;
                        }
                        if (m.getAgeRating() != null && (m.getAgeRating().contains("18+") || m.getAgeRating().equalsIgnoreCase("A") || m.getAgeRating().equalsIgnoreCase("R"))) {
                            return false;
                        }
                        if (m.getGenre() != null && m.getGenre().toLowerCase().contains("horror")) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted((m1, m2) -> {
                    int score1 = calculateAffinityScore(m1, finalPreferredGenres);
                    int score2 = calculateAffinityScore(m2, finalPreferredGenres);
                    if (score1 != score2) {
                        return Integer.compare(score2, score1);
                    }
                    double r1 = m1.getRating() != null ? m1.getRating() : 0.0;
                    double r2 = m2.getRating() != null ? m2.getRating() : 0.0;
                    return Double.compare(r2, r1);
                })
                .limit(10)
                .collect(Collectors.toList());
    }

    private int calculateAffinityScore(Movie movie, Set<String> preferredGenres) {
        if (movie.getGenre() == null) return 0;
        int score = 0;
        String[] genres = movie.getGenre().split(",");
        for (String g : genres) {
            if (preferredGenres.contains(g.trim().toLowerCase())) {
                score += 10;
            }
        }
        return score;
    }
}
