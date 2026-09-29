package com.example.movie.controller;

import com.example.movie.model.Favorite;
import com.example.movie.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @GetMapping
    public ResponseEntity<List<Favorite>> getFavorites(@RequestParam Long userId) {
        return ResponseEntity.ok(favoriteRepository.findByUserIdOrderByAddedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody Favorite fav) {
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndMovieId(fav.getUserId(), fav.getMovieId());
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("message", "Already in favorites", "favorite", existing.get()));
        }
        Favorite saved = favoriteRepository.save(fav);
        return ResponseEntity.ok(Map.of("message", "Added to favorites", "favorite", saved));
    }

    @Transactional
    @DeleteMapping
    public ResponseEntity<?> removeFavorite(@RequestParam Long userId, @RequestParam Long movieId) {
        favoriteRepository.deleteByUserIdAndMovieId(userId, movieId);
        return ResponseEntity.ok(Map.of("message", "Removed from favorites"));
    }
}
