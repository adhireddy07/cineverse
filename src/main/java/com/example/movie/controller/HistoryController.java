package com.example.movie.controller;

import com.example.movie.dto.WatchProgressRequest;
import com.example.movie.model.WatchProgress;
import com.example.movie.repository.WatchProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @Autowired
    private WatchProgressRepository watchProgressRepository;

    @GetMapping
    public ResponseEntity<List<WatchProgress>> getHistory(@RequestParam Long userId) {
        return ResponseEntity.ok(watchProgressRepository.findByUserIdOrderByLastWatchedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<?> saveProgress(@RequestBody WatchProgressRequest req) {
        Optional<WatchProgress> opt = watchProgressRepository.findByUserIdAndMovieId(req.getUserId(), req.getMovieId());
        WatchProgress wp;
        if (opt.isPresent()) {
            wp = opt.get();
            wp.setProgressPercent(req.getProgressPercent());
            wp.setLastWatchedAt(LocalDateTime.now());
        } else {
            wp = new WatchProgress(req.getUserId(), req.getMovieId(), req.getMovieTitle(), req.getMoviePoster(), req.getProgressPercent());
        }
        watchProgressRepository.save(wp);
        return ResponseEntity.ok(Map.of("message", "Watch progress updated"));
    }
}
