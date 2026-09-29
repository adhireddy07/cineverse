/**
 * CineVerse Biometric Face Verification Engine
 * Handles webcam stream, face alignment UI, canvas frame capture,
 * and 128-dimensional facial biometric descriptor extraction.
 */
class FaceBiometricEngine {
    constructor() {
        this.videoStream = null;
    }

    async startCamera(videoElement) {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Webcam API not supported in this browser.");
            }
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: "user" },
                audio: false
            });
            videoElement.srcObject = this.videoStream;
            await videoElement.play();
            return { success: true };
        } catch (err) {
            console.warn("Camera access failed or denied:", err.message);
            return { success: false, error: err.message };
        }
    }

    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }

    /**
     * Captures a frame from video element and extracts:
     * 1. 128-dimensional biometric descriptor vector
     * 2. Base64 JPEG facial snapshot
     */
    captureBiometrics(videoElement) {
        const canvas = document.createElement("canvas");
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        // Draw and crop center square
        if (videoElement && videoElement.videoWidth) {
            const vWidth = videoElement.videoWidth;
            const vHeight = videoElement.videoHeight;
            const minDim = Math.min(vWidth, vHeight);
            const startX = (vWidth - minDim) / 2;
            const startY = (vHeight - minDim) / 2;
            ctx.drawImage(videoElement, startX, startY, minDim, minDim, 0, 0, size, size);
        } else {
            // Simulated / fallback face pattern if camera unavailable
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = "#ffc107";
            ctx.beginPath();
            ctx.arc(64, 64, 40, 0, Math.PI * 2);
            ctx.fill();
        }

        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.7);

        // Extract 128-dimensional biometric descriptor:
        // [0..63] : 8x8 regional spatial luminance features
        // [64..127]: 8x8 high-frequency Sobel edge/contour energy features
        const imgData = ctx.getImageData(0, 0, size, size).data;
        const descriptor = new Array(128).fill(0);

        // Convert to grayscale 2D array
        const gray = new Float32Array(size * size);
        for (let i = 0, p = 0; i < imgData.length; i += 4, p++) {
            gray[p] = (0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]) / 255.0;
        }

        const blockSize = Math.floor(size / 8); // 16 pixels per block

        // 1. Regional Spatial Luminance (64 dimensions)
        for (let by = 0; by < 8; by++) {
            for (let bx = 0; bx < 8; bx++) {
                let sumLum = 0.0;
                let count = 0;
                for (let y = by * blockSize; y < (by + 1) * blockSize; y++) {
                    for (let x = bx * blockSize; x < (bx + 1) * blockSize; x++) {
                        sumLum += gray[y * size + x];
                        count++;
                    }
                }
                descriptor[by * 8 + bx] = count > 0 ? (sumLum / count) : 0;
            }
        }

        // 2. Regional Sobel Edge & Contour Energy (64 dimensions)
        for (let by = 0; by < 8; by++) {
            for (let bx = 0; bx < 8; bx++) {
                let sumEdge = 0.0;
                let count = 0;
                for (let y = by * blockSize + 1; y < (by + 1) * blockSize - 1; y++) {
                    for (let x = bx * blockSize + 1; x < (bx + 1) * blockSize - 1; x++) {
                        // Horizontal Sobel gx
                        const gx = (gray[(y - 1) * size + (x + 1)] + 2 * gray[y * size + (x + 1)] + gray[(y + 1) * size + (x + 1)]) -
                                   (gray[(y - 1) * size + (x - 1)] + 2 * gray[y * size + (x - 1)] + gray[(y + 1) * size + (x - 1)]);
                        // Vertical Sobel gy
                        const gy = (gray[(y + 1) * size + (x - 1)] + 2 * gray[(y + 1) * size + x] + gray[(y + 1) * size + (x + 1)]) -
                                   (gray[(y - 1) * size + (x - 1)] + 2 * gray[(y - 1) * size + x] + gray[(y - 1) * size + (x + 1)]);
                        sumEdge += Math.sqrt(gx * gx + gy * gy);
                        count++;
                    }
                }
                descriptor[64 + by * 8 + bx] = count > 0 ? (sumEdge / count) : 0;
            }
        }

        // 3. Zero-mean and L2 unit-norm normalization
        let mean = 0.0;
        for (let i = 0; i < 128; i++) mean += descriptor[i];
        mean /= 128.0;

        let normSq = 0.0;
        for (let i = 0; i < 128; i++) {
            descriptor[i] -= mean;
            normSq += descriptor[i] * descriptor[i];
        }
        const norm = Math.sqrt(normSq) || 1.0;
        const normalizedDescriptor = descriptor.map(v => parseFloat((v / norm).toFixed(5)));

        return {
            photoUrl: photoDataUrl,
            descriptor: JSON.stringify(normalizedDescriptor)
        };
    }
}

window.faceEngine = new FaceBiometricEngine();