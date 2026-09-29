document.addEventListener("DOMContentLoaded", () => {
    loadPersonalizedRecommendations();
});

async function loadPersonalizedRecommendations() {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const grid = document.getElementById("recommendationsGrid");
    const userBadge = document.getElementById("userBadge");
    const shield = document.getElementById("under18ShieldAlert");

    const isUnder18 = (user.age !== undefined && user.age !== null && user.age < 18);

    if (user.fullName) {
        userBadge.innerHTML = `<i class="bi bi-person-fill"></i> ${user.fullName} (${user.age || "N/A"} yrs)`;
    }

    if (isUnder18) {
        shield.style.display = "inline-block";
    }

    try {
        const url = user.userId 
            ? `/api/movies/recommendations?userId=${user.userId}&isUnder18=${isUnder18}` 
            : `/api/movies/recommendations?isUnder18=${isUnder18}`;
        const resp = await fetch(url);
        const movies = await resp.json();

        if (!movies || movies.length === 0) {
            grid.innerHTML = `<div class="col-12 text-center text-muted"><h4>No recommendations found. Try selecting more genres in Preferences!</h4></div>`;
            return;
        }

        grid.innerHTML = movies.map(m => {
            const isRestricted = (m.isAdult || m.isHorror || (m.ageRating && (m.ageRating.includes("18+") || m.ageRating === "A")));
            const badgeClass = isRestricted ? "badge-age" : "badge-safe";
            const badgeText = m.ageRating || (isRestricted ? "18+" : "U/A");

            return `
                <div class="col-md-4 col-lg-3">
                    <div class="movie-card">
                        <img src="${m.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'}" class="movie-img" alt="${m.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';">
                        <div class="card-body">
                            <h5 class="fw-bold text-white mb-1 text-truncate">${m.title}</h5>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge ${badgeClass}">${badgeText}</span>
                                <span class="text-warning small fw-bold"> ${m.rating || "N/A"}</span>
                            </div>
                            <p class="text-muted small mb-3 text-truncate">${m.genre || "General"}</p>
                            <a href="movie-details.html?id=${m.id}" class="btn btn-warning w-100 fw-bold mt-auto">
                                View Details & Watch
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (e) {
        console.error("Failed to load recommendations:", e);
        grid.innerHTML = `<div class="col-12 text-center text-danger"><h4>Failed to load recommendations. Please verify the backend server is running.</h4></div>`;
    }
}