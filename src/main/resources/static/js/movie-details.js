console.log("movie-details.js loaded (OTT Platforms + YouTube + TMDB)");

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
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

let currentMovie = null;
let officialTrailerKey = null;
let isPlaying = false;
let playInterval = null;
let currentPercent = 0;
let userStarRating = 5;
let isFav = false;

document.addEventListener("DOMContentLoaded", () => {
    if (!movieId) {
        window.location.href = "dashboard.html";
        return;
    }
    const trailerBtn = document.getElementById("trailerBtn");
    if (trailerBtn) {
        trailerBtn.addEventListener("click", function(e) {
            e.preventDefault();
            openInPageTrailer(getTrailerUrl(), currentMovie ? currentMovie.title : "");
        });
    }
    const ytBtn = document.getElementById("youtubeWatchBtn");
    if (ytBtn) {
        ytBtn.addEventListener("click", function(e) {
            e.preventDefault();
            openInPageTrailer(getTrailerUrl(), currentMovie ? currentMovie.title : "");
        });
    }

    // Modal stop video on close so sound doesn't continue playing
    const modalEl = document.getElementById("trailerModal");
    if (modalEl) {
        modalEl.addEventListener("hidden.bs.modal", () => {
            const iframe = document.getElementById("trailerIframe");
            if (iframe) iframe.src = "";
        });
    }

    loadMovieDetails();
});


async function loadMovieDetails() {
    // 1. Fetch from Spring Boot backend (authoritative content filter & database)
    try {
        const localResp = await fetch(`/api/movies/${movieId}?isUnder18=${isUnder18}`);
        if (localResp.status === 403) {
            const errData = await localResp.json();
            showRestrictedShield(errData.title || "Restricted Title");
            return;
        }
        if (localResp.ok) {
            currentMovie = await localResp.json();
            renderMovie(currentMovie);
            checkFavoriteStatus();
            setupOttPlatforms(currentMovie.title);
            fetchTrailerVideos(currentMovie.title);
            return;
        }
    } catch (e) {
        console.warn("Backend movie details fetch failed:", e);
    }

    alert("Movie not found or unavailable.");
    window.location.href = "dashboard.html";
}

function showRestrictedShield(title) {
    document.getElementById("mainMovieContent").style.display = "none";
    const shield = document.getElementById("restrictedShield");
    shield.style.display = "block";
    document.getElementById("restrictedMovieTitle").textContent = title;
}

function renderMovie(m) {
    const posterEl = document.getElementById("poster");
    if (posterEl) {
        posterEl.src = m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
        posterEl.onerror = function() {
            this.onerror = null;
            this.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
        };
    }
    document.getElementById("title").textContent = m.title;
    document.getElementById("rating").textContent = m.rating || "N/A";
    document.getElementById("genre").textContent = m.genre || "General";
    document.getElementById("language").textContent = m.language || "English";
    document.getElementById("year").textContent = m.releaseYear || "2024";
    document.getElementById("overview").textContent = m.overview || "No description available.";

    const ageBadge = document.getElementById("ageRatingBadge");
    if (ageBadge) {
        ageBadge.textContent = m.ageRating || "U/A";
        if (m.isAdult || m.isHorror || (m.ageRating && (m.ageRating.includes("18+") || m.ageRating === "A"))) {
            ageBadge.className = "badge bg-danger fs-6";
        } else {
            ageBadge.className = "badge bg-success fs-6";
        }
    }

    updateTrailerButtonUrls();
}

/**
 * Sets up OTT streaming platform deep links (Hotstar, Aha, Netflix, Prime, Zee5, YouTube)
 */
async function setupOttPlatforms(title, tmdbId) {
    const q = encodeURIComponent(title);

    // Direct deep-search URLs for popular OTT platforms
    document.getElementById("btnHotstar").href = `https://www.hotstar.com/in/explore?search_query=${q}`;
    document.getElementById("btnAha").href = `https://www.aha.video/search?q=${q}`;
    document.getElementById("btnNetflix").href = `https://www.netflix.com/search?q=${q}`;
    document.getElementById("btnPrime").href = `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${q}`;
    document.getElementById("btnZee5").href = `https://www.zee5.com/search?q=${q}`;
    document.getElementById("btnYtFull").href = `https://www.youtube.com/results?search_query=${q}+full+movie`;

    // Fetch official watch provider data if available from TMDB
    if (tmdbId) {
        try {
            const resp = await fetch(`${BASE_URL}/movie/${tmdbId}/watch/providers`, {
                headers: { Authorization: `Bearer ${API_TOKEN}` }
            });
            const data = await resp.json();
            const providersIN = data.results && data.results.IN;
            if (providersIN && (providersIN.flatrate || providersIN.rent || providersIN.buy)) {
                const streamList = [
                    ...(providersIN.flatrate || []),
                    ...(providersIN.rent || []),
                    ...(providersIN.buy || [])
                ];
                const providerNames = streamList.map(p => p.provider_name).join(", ");
                console.log("Official India Providers:", providerNames);
            }
        } catch (e) {
            console.warn("Could not load TMDB watch providers:", e);
        }
    }
}

async function fetchTmdbTrailer(tmdbId, title) {
    try {
        const resp = await fetch(`${BASE_URL}/movie/${tmdbId}/videos`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        const data = await resp.json();
        const trailer = data.results && data.results.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));

        if (trailer && trailer.key) {
            officialTrailerKey = trailer.key;
        }
    } catch (e) {
        console.warn("Could not fetch TMDB trailer:", e);
    }
    updateTrailerButtonUrls();
}

async function fetchTrailerVideos(title) {
    officialTrailerKey = null;
    try {
        const resp = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(title)}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        const data = await resp.json();
        if (data.results && data.results.length > 0) {
            await fetchTmdbTrailer(data.results[0].id, title);
            return;
        }
    } catch (e) {
        console.warn("Error finding TMDB trailer for " + title, e);
    }
    updateTrailerButtonUrls();
}

function getTrailerUrl() {
    if (currentMovie && currentMovie.trailerUrl && currentMovie.trailerUrl.trim()) {
        return currentMovie.trailerUrl.trim();
    }
    if (officialTrailerKey) {
        return `https://www.youtube.com/watch?v=${officialTrailerKey}`;
    }
    const title = (currentMovie && currentMovie.title) ? currentMovie.title : "Movie";
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`;
}

function getYouTubeWatchUrl() {
    const title = (currentMovie && currentMovie.title) ? currentMovie.title : "Movie";
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " full movie")}`;
}

function extractYouTubeId(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

function openInPageTrailer(urlOrKey, title) {
    let videoId = extractYouTubeId(urlOrKey);
    if (!videoId && officialTrailerKey) {
        videoId = officialTrailerKey;
    }
    if (!videoId && currentMovie && currentMovie.trailerUrl) {
        videoId = extractYouTubeId(currentMovie.trailerUrl);
    }

    const iframe = document.getElementById("trailerIframe");
    const titleEl = document.getElementById("trailerModalTitle");
    const modalEl = document.getElementById("trailerModal");

    if (!modalEl || !iframe) {
        console.error("Trailer modal elements not found in DOM");
        return;
    }

    const movieName = title || (currentMovie ? currentMovie.title : "Movie");
    if (titleEl) {
        titleEl.textContent = movieName + " - Official Trailer";
    }

    if (videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    } else {
        const query = encodeURIComponent(movieName + " official trailer");
        iframe.src = `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1`;
    }

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    } else {
        modalEl.classList.add("show");
        modalEl.style.display = "block";
    }
}

function updateTrailerButtonUrls() {
    // In-page player is actively attached to #trailerBtn and #youtubeWatchBtn
}

function watchOfficialTrailer(e) {
    if (e && e.preventDefault) e.preventDefault();
    openInPageTrailer(getTrailerUrl(), currentMovie ? currentMovie.title : "");
}

function watchOnYouTube(e) {
    if (e && e.preventDefault) e.preventDefault();
    openInPageTrailer(getTrailerUrl(), currentMovie ? currentMovie.title : "");
}


function togglePlay() {
    isPlaying = !isPlaying;
    const icon = document.getElementById("playIcon");

    if (isPlaying) {
        icon.className = "bi bi-pause-fill fs-3";
        playInterval = setInterval(() => {
            if (currentPercent < 100) {
                currentPercent += 1;
                document.getElementById("progressSlider").value = currentPercent;
                if (currentPercent % 5 === 0) saveWatchProgress(currentPercent);
            } else {
                togglePlay();
            }
        }, 1000);
    } else {
        icon.className = "bi bi-play-fill fs-3";
        clearInterval(playInterval);
        saveWatchProgress(currentPercent);
    }
}

function handleProgressChange(val) {
    currentPercent = parseInt(val);
    saveWatchProgress(currentPercent);
}

async function saveWatchProgress(percent) {
    if (!currentUser.userId || !currentMovie) return;

    try {
        await fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId,
                movieId: currentMovie.id,
                movieTitle: currentMovie.title,
                moviePoster: currentMovie.poster,
                progressPercent: percent
            })
        });

        const notice = document.getElementById("watchStatusNotice");
        notice.style.display = "block";
        setTimeout(() => { notice.style.display = "none"; }, 2500);
    } catch (e) {
        console.warn("Could not save watch history:", e);
    }
}

async function checkFavoriteStatus() {
    if (!currentUser.userId || !currentMovie) return;

    try {
        const resp = await fetch(`/api/favorites?userId=${currentUser.userId}`);
        const favs = await resp.json();
        isFav = favs.some(f => f.movieId === currentMovie.id);
        updateFavoriteButton();
    } catch (e) {
        console.warn("Could not check favorites:", e);
    }
}

function updateFavoriteButton() {
    const btn = document.getElementById("favoriteBtn");
    if (isFav) {
        btn.className = "btn btn-outline-danger btn-action-lg";
        btn.innerHTML = `<i class="bi bi-heart-break-fill"></i> Remove from Favorites`;
    } else {
        btn.className = "btn btn-danger btn-action-lg";
        btn.innerHTML = `<i class="bi bi-heart-fill"></i> Add to Favorites`;
    }
}

async function toggleFavorite() {
    if (!currentUser.userId) {
        alert("Please login first to manage favorites!");
        window.location.href = "login.html";
        return;
    }

    if (isFav) {
        await fetch(`/api/favorites?userId=${currentUser.userId}&movieId=${currentMovie.id}`, {
            method: "DELETE"
        });
        isFav = false;
    } else {
        await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId,
                movieId: currentMovie.id,
                movieTitle: currentMovie.title,
                moviePoster: currentMovie.poster,
                movieGenre: currentMovie.genre,
                movieRating: currentMovie.rating
            })
        });
        isFav = true;
    }
    updateFavoriteButton();
}

function setRating(val) {
    userStarRating = val;
    document.querySelectorAll(".star-btn").forEach(btn => {
        const bVal = parseInt(btn.dataset.val);
        if (bVal <= val) {
            btn.className = "bi bi-star-fill text-warning star-btn fs-3";
        } else {
            btn.className = "bi bi-star text-secondary star-btn fs-3";
        }
    });
}

async function submitQuickReview() {
    const text = document.getElementById("quickReviewText").value.trim();
    if (!text) {
        alert("Please write a short review text!");
        return;
    }

    try {
        await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId || null,
                userName: currentUser.fullName || "Movie Fan",
                movieName: currentMovie.title,
                rating: userStarRating,
                reviewText: text
            })
        });
        alert("Thank you! Your review has been saved.");
        document.getElementById("quickReviewText").value = "";
    } catch (e) {
        console.error("Review submit error:", e);
    }
}