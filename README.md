# CineVerse - AI-Powered Movie Recommendation & Streaming Platform

CineVerse is a full-stack movie discovery and streaming web application built with Spring Boot, JPA, H2 Database, Face Biometric Verification, and dynamic age-rated content protection.

## Features
- **Authoritative Backend Moderation:** Under-18 profiles are strictly protected from adult/A-rated content at the database and API level.
- **Biometric Face Verification:** Secure AI face matching for authentication.
- **Rich Streaming Interface:** Trending movies, search, personalized recommendations, and instant trailer playback.
- **Cloud Ready:** Containerized with Docker for 24/7 deployment on Render, Railway, or any cloud platform.

## Run with Docker
```bash
docker build -t cineverse .
docker run -p 8080:8080 cineverse
```
