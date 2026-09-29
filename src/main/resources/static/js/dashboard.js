console.log("dashboard.js loaded (Instant Load + TMDB)");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const isUnder18 = (currentUser.age !== undefined && currentUser.age !== null && currentUser.age < 18);

const LANGUAGE_MAP = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
    "ta": "Tamil",
    "ml": "Malayalam",
    "kn": "Kannada",
    "ja": "Japanese",
    "ko": "Korean",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "zh": "Chinese"
};

document.addEventListener("DOMContentLoaded", () => {
    initUserPill();
    loadContinueWatching();
    loadRecommendedMovies();
    loadTrendingMovies();

    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", performSearch);
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") performSearch();
        });
    }

    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }
});

function initUserPill() {
    const pill = document.getElementById("userPill");
    const banner = document.getElementById("under18Banner");

    if (!pill) return;

    if (currentUser.fullName) {
        if (isUnder18) {
            pill.className = "user-age-pill pill-minor";
            pill.innerHTML = '<i class="bi bi-shield-fill"></i> ' + currentUser.fullName + ' (' + currentUser.age + 'y - Junior)';
            if (banner) banner.style.setProperty("display", "flex", "important");
        } else {
            pill.className = "user-age-pill pill-adult";
            pill.innerHTML = '<i class="bi bi-patch-check-fill"></i> ' + currentUser.fullName + ' (' + (currentUser.age || 18) + 'y - Adult)';
        }
    } else {
        pill.innerHTML = '<a href="login.html" class="text-warning text-decoration-none">Login / Register</a>';
    }
}

async function loadContinueWatching() {
    if (!currentUser.userId) return;

    try {
        const resp = await fetch('/api/history?userId=' + currentUser.userId);
        const history = await resp.json();
        const section = document.getElementById("continueSection");
        const container = document.getElementById("historyContainer");

        if (history && history.length > 0 && section && container) {
            section.style.display = "block";
            container.innerHTML = history.slice(0, 4).map(h => `
                <div class="col-6 col-md-3">
                    <div class="movie-card">
                        <img src="${h.moviePoster || 'https://via.placeholder.com/300x450'}" alt="${h.movieTitle}">
                        <div class="card-body">
                            <h6 class="fw-bold text-white text-truncate mb-1">${h.movieTitle}</h6>
                            <div class="progress my-2" style="height: 6px;">
                                <div class="progress-bar bg-warning" style="width: ${h.progressPercent || 30}%"></div>
                            </div>
                            <a href="movie-details.html?id=${h.movieId}" class="btn btn-warning btn-sm w-100 fw-bold">
                                Resume (${h.progressPercent || 30}%)
                            </a>
                        </div>
                    </div>
                </div>
            `).join("");
        }
    } catch (e) {
        console.warn("Could not load history:", e);
    }
}

async function loadRecommendedMovies() {
    const container = document.getElementById("recommendContainer");
    if (!container) return;

    try {
        const url = currentUser.userId 
            ? ('/api/movies/recommendations?userId=' + currentUser.userId + '&isUnder18=' + isUnder18) 
            : ('/api/movies/recommendations?isUnder18=' + isUnder18);
        const resp = await fetch(url);
        const movies = await resp.json();

        if (movies && movies.length > 0) {
            container.innerHTML = movies.slice(0, 4).map(m => renderMovieCard(m)).join("");
        } else {
            container.innerHTML = '<div class="col-12 text-muted py-3">No recommendations available yet.</div>';
        }
    } catch (e) {
        console.error("Error loading recommendations:", e);
        container.innerHTML = '<div class="col-12 text-danger small py-3">Could not load recommendations.</div>';
    }
}

async function loadTrendingMovies() {
    const container = document.getElementById("trendingContainer");
    if (!container) return;

    try {
        const localResp = await fetch('/api/movies/trending?isUnder18=' + isUnder18);
        const movies = await localResp.json();
        if (movies && movies.length > 0) {
            container.innerHTML = movies.map(m => renderMovieCard(m)).join("");
        } else {
            container.innerHTML = '<div class="col-12 text-muted py-3">No trending movies found.</div>';
        }
    } catch (e) {
        console.warn("Local trending fetch failed:", e);
        container.innerHTML = '<div class="col-12 text-danger small py-3">Could not load trending movies.</div>';
    }
}

async function performSearch() {
    const q = document.getElementById("searchInput").value.trim();
    const searchSection = document.getElementById("searchSection");
    const container = document.getElementById("movieContainer");

    if (!q) {
        searchSection.style.display = "none";
        return;
    }

    searchSection.style.display = "block";
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-warning"></div><p class="text-muted small mt-2">Searching movie catalog for "' + q + '"...</p></div>';

    try {
        const localRes = await fetch('/api/movies/search?q=' + encodeURIComponent(q) + '&isUnder18=' + isUnder18);
        const results = await localRes.json();

        if (results && results.length > 0) {
            container.innerHTML = results.map(m => renderMovieCard(m)).join("");
        } else {
            container.innerHTML = '<div class="col-12 text-center py-4"><h5 class="text-muted">No movies found matching "' + q + '"</h5>' + (isUnder18 ? '<p class="text-warning small"><i class="bi bi-shield-fill me-1"></i> If this title is an 18+ Adult or Horror film, it is hidden by Under-18 Safe Mode.</p>' : '') + '</div>';
        }
    } catch (e) {
        console.warn("Search error:", e);
        container.innerHTML = '<div class="col-12 text-danger small py-3">Search request failed.</div>';
    }
}

function normalizeTmdbMovie(tm) {
    const isAdultMovie = tm.adult === true;
    const isHorrorMovie = (tm.genre_ids && tm.genre_ids.includes(27));

    let posterUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
    if (tm.poster_path) {
        posterUrl = 'https://image.tmdb.org/t/p/w500' + tm.poster_path;
    }

    const yearStr = tm.release_date ? tm.release_date.split("-")[0] : "N/A";
    const langCode = tm.original_language ? tm.original_language.toLowerCase() : "en";
    const readableLang = LANGUAGE_MAP[langCode] || langCode.toUpperCase();

    return {
        id: tm.id,
        title: tm.title || tm.name || "Untitled",
        poster: posterUrl,
        rating: tm.vote_average ? parseFloat(tm.vote_average.toFixed(1)) : 0.0,
        genre: isHorrorMovie ? "Horror" : (isAdultMovie ? "Adult 18+" : "Feature"),
        genreIds: tm.genre_ids || [],
        releaseYear: yearStr,
        language: readableLang,
        ageRating: isAdultMovie ? "18+" : (isHorrorMovie ? "A" : "U/A"),
        isAdult: isAdultMovie,
        isHorror: isHorrorMovie,
        overview: tm.overview || ""
    };
}

function applyUnder18Filter(movies) {
    if (!isUnder18) return movies;

    return movies.filter(m => {
        if (m.isAdult === true) return false;
        if (m.isHorror === true) return false;
        if (m.genreIds && m.genreIds.includes(27)) return false;
        if (m.genre && m.genre.toLowerCase().includes("horror")) return false;
        if (m.ageRating && (m.ageRating.includes("18+") || m.ageRating === "A" || m.ageRating === "R")) return false;
        return true;
    });
}

function renderMovieCard(m) {
    const isRestricted = (m.isAdult || m.isHorror || (m.ageRating && (m.ageRating.includes("18+") || m.ageRating === "A")));
    const badgeClass = isRestricted ? "badge-age" : "badge-safe";
    const badgeText = m.ageRating || (isRestricted ? "18+" : "U/A");

    return `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="movie-card">
                <img src="${m.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'}" alt="${m.title}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';">
                <div class="card-body">
                    <h6 class="fw-bold text-white mb-1 text-truncate" title="${m.title}">${m.title}</h6>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge ${badgeClass} small">${badgeText}</span>
                        <span class="text-warning small fw-bold"><i class="bi bi-star-fill text-warning me-1"></i>${m.rating || "N/A"}</span>
                    </div>
                    <p class="text-muted small text-truncate mb-3">${m.releaseYear ? m.releaseYear + ' | ' : ''}${m.language || 'English'} | ${m.genre || "Cinema"}</p>
                    <div class="d-flex gap-2 mt-auto">
                        <a href="movie-details.html?id=${m.id}" class="btn btn-warning btn-sm w-100 fw-bold">
                            Details & OTT
                        </a>
                        <button class="btn btn-outline-danger btn-sm" title="Add to Favorites" onclick="quickAddFavorite(${m.id}, '${escapeQuote(m.title)}', '${escapeQuote(m.poster)}', '${escapeQuote(m.genre)}', ${m.rating})">
                            <i class="bi bi-heart-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function escapeQuote(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function quickAddFavorite(movieId, title, poster, genre, rating) {
    if (!currentUser.userId) {
        alert("Please login to save favorites!");
        window.location.href = "login.html";
        return;
    }

    try {
        const resp = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId,
                movieId: movieId,
                movieTitle: title,
                moviePoster: poster,
                movieGenre: genre,
                movieRating: rating
            })
        });
        const data = await resp.json();
        alert(data.message || "Saved to favorites!");
    } catch (e) {
        console.error("Favorite add error:", e);
    }
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const btn = document.getElementById("themeBtn");
    if (btn) {
        btn.innerHTML = document.body.classList.contains("light-mode") ? '<i class="bi bi-sun-fill text-warning"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
