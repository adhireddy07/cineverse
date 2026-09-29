// CineVerse PWA Install Manager
let deferredPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
            .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
    });
}

// Listen for BeforeInstallPrompt event on Mobile
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
});

function showInstallPromotion() {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem('pwa_banner_dismissed')) return;

    let banner = document.getElementById('pwa-install-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 16px; right: 16px; background: rgba(15, 23, 42, 0.95); border: 2px solid #ffc107; border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 9999; backdrop-filter: blur(10px);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="/icons/icon-192.png" style="width: 42px; height: 42px; border-radius: 10px; border: 1px solid #ffc107;">
                    <div>
                        <div style="color: #fff; font-weight: bold; font-size: 15px;">Install CineVerse App</div>
                        <div style="color: #94a3b8; font-size: 12px;">Fast, full-screen mobile app</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="pwa-install-btn" style="background: linear-gradient(90deg, #ffb300, #ff5722); color: #000; border: none; font-weight: bold; border-radius: 10px; padding: 8px 16px; font-size: 13px; cursor: pointer;">Install</button>
                    <button id="pwa-dismiss-btn" style="background: transparent; color: #64748b; border: none; font-size: 20px; cursor: pointer; padding: 0 4px;">&times;</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`[PWA] User choice: ${outcome}`);
                deferredPrompt = null;
                banner.remove();
            }
        });

        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
            sessionStorage.setItem('pwa_banner_dismissed', 'true');
            banner.remove();
        });
    }
}

window.addEventListener('appinstalled', () => {
    console.log('[PWA] CineVerse was successfully installed on device!');
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
});
