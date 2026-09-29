package com.example.movie.repository;

import com.example.movie.model.WatchProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchProgressRepository extends JpaRepository<WatchProgress, Long> {
    Optional<WatchProgress> findByUserIdAndMovieId(Long userId, Long movieId);
    List<WatchProgress> findByUserIdOrderByLastWatchedAtDesc(Long userId);
}
