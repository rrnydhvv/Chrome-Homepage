// newtab.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Dịch đa ngôn ngữ (i18n)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const msg = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
        if (msg) el.textContent = msg;
    });

    const fileInput = document.getElementById('bg-upload');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const resetBtn = document.getElementById('reset-btn');

    const zoomSlider = document.getElementById('bg-zoom');
    const panXSlider = document.getElementById('bg-pan-x');
    const panYSlider = document.getElementById('bg-pan-y');
    const zoomVal = document.getElementById('val-zoom');
    const panXVal = document.getElementById('val-pan-x');
    const panYVal = document.getElementById('val-pan-y');

    // Mở / đóng cài đặt
    if (openBtn && settingsPanel) {
        openBtn.onclick = () => settingsPanel.classList.toggle('show');
    }
    if (closeBtn && settingsPanel) {
        closeBtn.onclick = () => settingsPanel.classList.remove('show');
    }

    // Xử lý nén ảnh và lưu vào IndexedDB
    if (fileInput) {
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 2560;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Chuyển Canvas thành Blob thay vì Base64
                canvas.toBlob((blob) => {
                    if (window.saveImageBlob && blob) {
                        window.saveImageBlob(blob).then(() => {
                            window.location.reload();
                        }).catch(err => console.error('Lỗi khi lưu ảnh', err));
                    }
                }, 'image/jpeg', 0.92);
            };
            img.src = URL.createObjectURL(file);
        };
    }

    // Khởi tạo thanh trượt từ Storage
    chrome.storage.local.get(['bgZoom', 'bgPanX', 'bgPanY'], (res) => {
        const z = res.bgZoom !== undefined ? res.bgZoom : 100;
        const px = res.bgPanX !== undefined ? res.bgPanX : 50;
        const py = res.bgPanY !== undefined ? res.bgPanY : 50;
        
        zoomSlider.value = z; zoomVal.value = z;
        panXSlider.value = px; panXVal.value = px;
        panYSlider.value = py; panYVal.value = py;
    });

    // Cập nhật giao diện khi kéo thanh trượt
    const applyRealTimeStyles = () => {
        const z = zoomSlider.value;
        const px = panXSlider.value;
        const py = panYSlider.value;

        zoomVal.value = z;
        panXVal.value = px;
        panYVal.value = py;

        document.body.style.backgroundSize = `${z}%`;
        document.body.style.backgroundPosition = `${px}% ${py}%`;
    };

    // Lưu vào storage
    const saveSettings = () => {
        chrome.storage.local.set({
            bgZoom: parseInt(zoomSlider.value, 10),
            bgPanX: parseInt(panXSlider.value, 10),
            bgPanY: parseInt(panYSlider.value, 10)
        });
    };

    // Lắng nghe sự kiện thanh trượt
    [zoomSlider, panXSlider, panYSlider].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', applyRealTimeStyles);
            slider.addEventListener('change', saveSettings);
        }
    });

    // Lắng nghe sự kiện từ ô nhập số
    const setupNumberInput = (slider, input) => {
        if (!input || !slider) return;
        
        const syncFromInput = () => {
            let val = parseInt(input.value, 10);
            if (isNaN(val)) val = slider.value;
            // Ép vào giới hạn của thanh trượt để tránh lỗi
            if (val < parseInt(slider.min)) val = slider.min;
            if (val > parseInt(slider.max)) val = slider.max;
            
            input.value = val;
            slider.value = val;
            
            document.body.style.backgroundSize = `${zoomSlider.value}%`;
            document.body.style.backgroundPosition = `${panXSlider.value}% ${panYSlider.value}%`;
        };

        // Khi người dùng gõ số, cho xem trước ngay
        input.addEventListener('input', syncFromInput);
        // Khi gõ xong (blur/enter), lưu lại
        input.addEventListener('change', () => {
            syncFromInput();
            saveSettings();
        });
    };

    setupNumberInput(zoomSlider, zoomVal);
    setupNumberInput(panXSlider, panXVal);
    setupNumberInput(panYSlider, panYVal);

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            zoomSlider.value = 100;
            panXSlider.value = 50;
            panYSlider.value = 50;
            applyRealTimeStyles();
            saveSettings();
        });
    }
});