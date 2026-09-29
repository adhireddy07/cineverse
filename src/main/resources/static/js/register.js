console.log("register.js loaded");

let userAge = null;
let biometricData = {
    faceDescriptor: null,
    facePhotoUrl: null
};

let faceModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    faceModalInstance = new bootstrap.Modal(document.getElementById("faceModal"));

    const dobInput = document.getElementById("dob");
    dobInput.addEventListener("change", handleDobChange);

    document.getElementById("openFaceModalBtn").addEventListener("click", () => {
        if (!dobInput.value) {
            alert("Please select your Date of Birth first to proceed with age verification.");
            dobInput.focus();
            return;
        }
        faceModalInstance.show();
        startEnrollmentCamera();
    });

    document.getElementById("registerForm").addEventListener("submit", handleRegisterSubmit);
});

function handleDobChange() {
    const dobValue = document.getElementById("dob").value;
    const badge = document.getElementById("ageBadge");
    if (!dobValue) {
        badge.style.display = "none";
        return;
    }

    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    userAge = age;

    badge.style.display = "block";
    if (age < 0) {
        badge.className = "age-badge-box age-minor";
        badge.innerHTML = " Invalid Date of Birth.";
        document.getElementById("submitBtn").disabled = true;
    } else if (age < 18) {
        badge.className = "age-badge-box age-minor";
        badge.innerHTML = ` <strong>Verified Age: ${age} Years (Junior Account)</strong><br><small>Strict Under-18 Protection will be applied. 18+ Adult & Horror movies will be restricted automatically.</small>`;
    } else {
        badge.className = "age-badge-box age-adult";
        badge.innerHTML = ` <strong>Verified Age: ${age} Years (Adult Account)</strong><br><small>Full CineVerse movie catalog unlocked.</small>`;
    }
}

async function startEnrollmentCamera() {
    const video = document.getElementById("cameraFeed");
    const status = document.getElementById("cameraStatus");
    status.textContent = "Connecting to webcam...";

    const res = await window.faceEngine.startCamera(video);
    if (res.success) {
        status.textContent = " Camera active. Align your face and click Capture.";
    } else {
        status.innerHTML = ` Camera unavailable: ${res.error}.<br>Click 'Fallback Simulator' to test with synthetic biometric embedding.`;
    }
}

function closeCamera() {
    window.faceEngine.stopCamera();
}

function captureAndEnrollFace() {
    const video = document.getElementById("cameraFeed");
    const biometrics = window.faceEngine.captureBiometrics(video);
    applyBiometricEnrollment(biometrics.descriptor, biometrics.photoUrl);
}

function simulateFaceEnrollment() {
    // Generates a mock 128D biometric vector for testing
    const mockVector = Array.from({ length: 128 }, () => parseFloat((Math.random() * 0.1).toFixed(4)));
    const mockPhoto = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    applyBiometricEnrollment(JSON.stringify(mockVector), mockPhoto);
}

function applyBiometricEnrollment(descriptor, photoUrl) {
    biometricData.faceDescriptor = descriptor;
    biometricData.facePhotoUrl = photoUrl;

    closeCamera();
    faceModalInstance.hide();

    // Update form UI
    const snapshot = document.getElementById("enrolledSnapshot");
    snapshot.src = photoUrl;
    snapshot.style.display = "block";

    const statusText = document.getElementById("biometricStatusText");
    statusText.innerHTML = `<span class="text-success fw-bold"> Face Biometrics Enrolled & Verified!</span>`;

    const openBtn = document.getElementById("openFaceModalBtn");
    openBtn.className = "btn btn-outline-success w-100 mb-3 fw-bold";
    openBtn.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> Face Enrolled (Click to Re-scan)`;

    document.getElementById("submitBtn").disabled = false;
}

async function handleRegisterSubmit(e) {
    e.preventDefault();

    if (!biometricData.faceDescriptor) {
        alert("Please complete Face Biometric Verification before registering.");
        return;
    }

    const payload = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        dob: document.getElementById("dob").value,
        faceDescriptor: biometricData.faceDescriptor,
        facePhotoUrl: biometricData.facePhotoUrl
    };

    try {
        const btn = document.getElementById("submitBtn");
        btn.disabled = true;
        btn.textContent = "Registering & Saving Biometrics...";

        const apiUrl = (typeof getApiUrl === 'function') ? getApiUrl("/api/auth/register") : "/api/auth/register";
        const resp = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        let data = {};
        try {
            data = await resp.json();
        } catch (_) {
            data = { success: false, message: `Server error (${resp.status}). Please try again.` };
        }

        if (resp.ok && data.success) {
            localStorage.setItem("currentUser", JSON.stringify(data));
            alert(`Registration successful! Welcome, ${data.fullName} (Age: ${data.age})`);
            window.location.href = "preferences.html";
        } else {
            alert(data.message || "Registration failed. Please try again.");
            btn.disabled = false;
            btn.textContent = "Complete Registration";
        }
    } catch (err) {
        console.error("Registration error:", err);
        alert("Failed to connect to backend server. If using mobile, please ensure you are accessing via the active HTTPS link: https://penguin-consequence-spectacular-supported.trycloudflare.com");
        document.getElementById("submitBtn").disabled = false;
        document.getElementById("submitBtn").textContent = "Complete Registration";
    }
}