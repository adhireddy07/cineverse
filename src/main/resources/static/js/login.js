console.log("login.js loaded");

let pendingAuth = {
    userId: null,
    email: null
};

let biometricModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    biometricModalInstance = new bootstrap.Modal(document.getElementById("biometricModal"));
    document.getElementById("loginForm").addEventListener("submit", handleStep1Login);
});

async function handleStep1Login(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");

    btn.disabled = true;
    btn.textContent = "Verifying Credentials...";

    try {
        const apiUrl = (typeof getApiUrl === 'function') ? getApiUrl("/api/auth/login-step1") : "/api/auth/login-step1";
        const resp = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        let data = {};
        try {
            data = await resp.json();
        } catch (_) {
            data = { success: false, message: `Server error (${resp.status}). Please verify the backend is running.` };
        }

        if (resp.ok && data.success) {
            if (data.requiresBiometric) {
                // Open Multi-Factor DOB + Face Verification Modal
                pendingAuth.userId = data.userId;
                pendingAuth.email = data.email;
                btn.disabled = false;
                btn.textContent = "Proceed to Verification";
                
                biometricModalInstance.show();
                startLoginCamera();
            } else {
                // Direct login
                loginSuccess(data);
            }
        } else {
            alert(data.message || "Invalid credentials.");
            btn.disabled = false;
            btn.textContent = "Proceed to Verification";
        }
    } catch (err) {
        console.error("Login step1 error:", err);
        alert("Failed to connect to backend server. If using mobile, ensure you are accessing via the live HTTPS link: https://penguin-consequence-spectacular-supported.trycloudflare.com");
        btn.disabled = false;
        btn.textContent = "Proceed to Verification";
    }
}


async function startLoginCamera() {
    const video = document.getElementById("loginCamera");
    const status = document.getElementById("bioStatusMsg");
    status.textContent = "Connecting to webcam...";

    const res = await window.faceEngine.startCamera(video);
    if (res.success) {
        status.textContent = " Camera active. Confirm Date of Birth & click Verify Face.";
    } else {
        status.innerHTML = ` Camera unavailable: ${res.error}.<br>Click 'Fallback Simulator' to authenticate.`;
    }
}

function closeLoginCamera() {
    window.faceEngine.stopCamera();
}

async function performBiometricVerification() {
    const dobInput = document.getElementById("verifyDob");
    const dob = dobInput.value;

    if (!dob) {
        alert("Please enter your Date of Birth to verify.");
        dobInput.focus();
        return;
    }

    const video = document.getElementById("loginCamera");
    const biometrics = window.faceEngine.captureBiometrics(video);
    sendBiometricLoginRequest(dob, biometrics.descriptor, biometrics.photoUrl);
}

function simulateLoginVerification() {
    const dobInput = document.getElementById("verifyDob");
    const dob = dobInput.value;

    if (!dob) {
        alert("Please enter your registered Date of Birth.");
        dobInput.focus();
        return;
    }

    // Pass synthetic vector to verify with backend
    const mockVector = Array.from({ length: 128 }, () => 0.05);
    sendBiometricLoginRequest(dob, JSON.stringify(mockVector), null);
}

async function sendBiometricLoginRequest(dob, descriptor, photoUrl) {
    const status = document.getElementById("bioStatusMsg");
    const verifyBtn = document.getElementById("verifyFaceBtn");

    status.innerHTML = `<div class="spinner-border spinner-border-sm text-warning me-2"></div> Comparing Face Biometrics & Verifying DOB...`;
    verifyBtn.disabled = true;

    try {
        const apiUrl = (typeof getApiUrl === 'function') ? getApiUrl("/api/auth/login-biometric") : "/api/auth/login-biometric";
        const resp = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: pendingAuth.userId,
                email: pendingAuth.email,
                dob: dob,
                faceDescriptor: descriptor,
                facePhotoUrl: photoUrl
            })
        });

        let data = {};
        try {
            data = await resp.json();
        } catch (_) {
            data = { success: false, message: `Server error (${resp.status}).` };
        }


        if (resp.ok && data.success) {
            status.innerHTML = `<span class="text-success fw-bold"> Face Biometric & DOB Verified! Redirecting...</span>`;
            setTimeout(() => {
                closeLoginCamera();
                biometricModalInstance.hide();
                loginSuccess(data);
            }, 800);
        } else {
            status.innerHTML = `<span class="text-danger fw-bold"> ${data.message || "Biometric verification failed."}</span>`;
            verifyBtn.disabled = false;
        }
    } catch (err) {
        console.error("Biometric verification error:", err);
        status.innerHTML = `<span class="text-danger">Error connecting to server.</span>`;
        verifyBtn.disabled = false;
    }
}

function loginSuccess(data) {
    localStorage.setItem("currentUser", JSON.stringify(data));
    window.location.href = "dashboard.html";
}