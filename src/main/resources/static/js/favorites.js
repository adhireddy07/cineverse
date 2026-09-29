console.log("favorites.js loaded");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

document.addEventListener("DOMContentLoaded", () => {
    if (!currentUser.userId) {
        alert("Please login to view your favorites.");
        window.location.href = "login.html";
        return;
    }
    loadFavorites();
});

async function loadFavorites() {
    const container = document.getElementById("favoriteContainer");
    const countBadge = document.getElementById("favCount");

    try {
        const resp = await fetch(`/api/favorites?userId=${currentUser.userId}`);
        const favorites = await resp.json();

        countBadge.textContent = `${favorites.length} Movies`;

        if (!favorites || favorites.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5 text-muted">
                    <i class="bi bi-heartbreak display-1 text-secondary mb-3"></i>
                    <h3>No Favorite Movies Yet</h3>
                    <p>Browse the catalog and click the heart icon on movies you love!</p>
                    <a href="dashboard.html" class="btn btn-warning mt-2 fw-bold">Explore Movies</a>
                </div>
            `;
            return;
        }

        container.innerHTML = favorites.map(f => `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="movie-card">
                    <img src="${f.moviePoster || 'https://via.placeholder.com/300x450'}" alt="${f.movieTitle}">
                    <div class="p-3 d-flex flex-column flex-1">
                        <h6 class="fw-bold text-white text-truncate mb-1">${f.movieTitle}</h6>
                        <span class="text-warning small mb-3"> ${f.movieRating || "N/A"}</span>
                        <div class="d-flex gap-2 mt-auto">
                            <a href="movie-details.html?id=${f.movieId}" class="btn btn-warning btn-sm w-100 fw-bold">
                                Watch
                            </a>
                            <button class="btn btn-outline-danger btn-sm" onclick="removeFavorite(${f.movieId})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");
    } catch (e) {
        console.error("Failed to load favorites:", e);
        container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load favorites.</div>`;
    }
}

async function removeFavorite(movieId) {
    try {
        await fetch(`/api/favorites?userId=${currentUser.userId}&movieId=${movieId}`, {
            method: "DELETE"
        });
        loadFavorites();
    } catch (e) {
        console.error("Delete favorite error:", e);
    }
}