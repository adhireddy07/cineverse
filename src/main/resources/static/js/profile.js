console.log("profile.js loaded");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

document.addEventListener("DOMContentLoaded", () => {
    if (!currentUser.userId && !currentUser.email) {
        alert("Please login to view profile.");
        window.location.href = "login.html";
        return;
    }

    renderProfile(currentUser);
    fetchLiveProfile();
});

function renderProfile(user) {
    document.getElementById("profName").textContent = user.fullName || "User";
    document.getElementById("profEmail").textContent = user.email || "";
    document.getElementById("profDob").textContent = user.dob || "Not set";
    document.getElementById("profAge").textContent = user.age ? `${user.age} Years Old` : "N/A";

    if (user.facePhotoUrl) {
        document.getElementById("profilePhoto").src = user.facePhotoUrl;
    }

    const ageBadge = document.getElementById("profAgeBadge");
    const filterTxt = document.getElementById("profFilter");

    if (user.age !== undefined && user.age !== null && user.age < 18) {
        ageBadge.className = "badge-status bg-danger";
        ageBadge.innerHTML = `<i class="bi bi-shield-fill"></i> Under-18 Protected (${user.age}y)`;
        filterTxt.innerHTML = `<span class="text-danger fw-bold"> Active (18+ Adult & Horror Blocked)</span>`;
    } else {
        ageBadge.className = "badge-status bg-success";
        ageBadge.innerHTML = `<i class="bi bi-patch-check-fill"></i> Verified Adult (${user.age || 18}y)`;
        filterTxt.innerHTML = `<span class="text-success fw-bold"> Unrestricted (Full Access)</span>`;
    }

    const prefGenres = localStorage.getItem("userPreferences");
    if (prefGenres) {
        document.getElementById("profGenres").textContent = prefGenres;
    }
}

async function fetchLiveProfile() {
    if (!currentUser.userId) return;
    try {
        const resp = await fetch(`/api/auth/profile?userId=${currentUser.userId}`);
        if (resp.ok) {
            const data = await resp.json();
            renderProfile(data);
            localStorage.setItem("currentUser", JSON.stringify(data));
        }
    } catch (e) {
        console.warn("Could not fetch live profile:", e);
    }
}