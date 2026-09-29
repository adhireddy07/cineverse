package com.example.movie.service;

import com.example.movie.model.Movie;
import com.example.movie.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getTrending(boolean isUnder18) {
        if (isUnder18) {
            return movieRepository.findTrendingSafeForUnder18();
        }
        return movieRepository.findByTrendingTrue();
    }

    public List<Movie> searchMovies(String query, boolean isUnder18) {
        if (query == null || query.trim().isEmpty()) {
            return getTrending(isUnder18);
        }
        if (isUnder18) {
            return movieRepository.searchMoviesSafeForUnder18(query.trim());
        }
        return movieRepository.searchMovies(query.trim());
    }

    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    public List<Movie> getAllEligibleMovies(boolean isUnder18) {
        if (isUnder18) {
            return movieRepository.findAllSafeForUnder18();
        }
        return movieRepository.findAll();
    }
}
