console.log("feedback.js loaded");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

document.addEventListener("DOMContentLoaded", () => {
    if (currentUser.fullName) {
        document.getElementById("fbName").value = currentUser.fullName;
    }
    loadReviews();
    document.getElementById("feedbackForm").addEventListener("submit", submitFeedback);
});

async function loadReviews() {
    const list = document.getElementById("reviewsList");
    try {
        const resp = await fetch("/api/reviews");
        const reviews = await resp.json();

        if (!reviews || reviews.length === 0) {
            list.innerHTML = `<div class="text-muted">No reviews yet. Be the first to review a movie!</div>`;
            return;
        }

        list.innerHTML = reviews.map(r => `
            <div class="review-item">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <h5 class="text-warning fw-bold m-0">${r.movieName}</h5>
                    <span class="text-warning">${"".repeat(r.rating || 5)}</span>
                </div>
                <div class="text-muted small mb-2">By <strong>${r.userName || "Movie Fan"}</strong></div>
                <p class="text-light small m-0">${r.reviewText || "Great movie!"}</p>
            </div>
        `).join("");
    } catch (e) {
        console.error("Could not load reviews:", e);
        list.innerHTML = `<div class="text-danger small">Failed to load reviews.</div>`;
    }
}

async function submitFeedback(e) {
    e.preventDefault();

    const name = document.getElementById("fbName").value.trim();
    const movie = document.getElementById("fbMovie").value.trim();
    const rating = parseInt(document.getElementById("fbRating").value);
    const review = document.getElementById("fbReview").value.trim();

    try {
        const btn = document.getElementById("fbSubmitBtn");
        btn.disabled = true;

        const resp = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId || null,
                userName: name,
                movieName: movie,
                rating: rating,
                reviewText: review
            })
        });

        const data = await resp.json();
        alert(data.message || "Feedback submitted!");
        document.getElementById("fbMovie").value = "";
        document.getElementById("fbReview").value = "";
        btn.disabled = false;
        loadReviews();
    } catch (e) {
        console.error("Submit review error:", e);
        alert("Failed to submit review.");
        document.getElementById("fbSubmitBtn").disabled = false;
    }
}