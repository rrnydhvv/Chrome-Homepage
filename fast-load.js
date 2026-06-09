// fast-load.js
chrome.storage.local.get(['bgZoom', 'bgPanX', 'bgPanY'], (res) => {
    // Default values if not set
    const zoom = res.bgZoom !== undefined ? res.bgZoom : 100;
    const panX = res.bgPanX !== undefined ? res.bgPanX : 50;
    const panY = res.bgPanY !== undefined ? res.bgPanY : 50;

    const applyStyles = (url) => {
        if (url) {
            document.body.style.backgroundImage = `url(${url})`;
            document.body.style.backgroundSize = `${zoom}%`;
            document.body.style.backgroundPosition = `${panX}% ${panY}%`;
        } else {
            // Hình nền mặc định nếu chưa upload ảnh
            document.body.style.background = 'linear-gradient(135deg, #2c3e50, #3498db)';
        }
        document.body.classList.add('loaded');
    };

    if (window.loadImageBlob) {
        window.loadImageBlob()
            .then(blob => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    applyStyles(url);
                } else {
                    applyStyles(null);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi load ảnh từ IndexedDB:", err);
                applyStyles(null);
            });
    } else {
        applyStyles(null);
    }
});