// newtab.js
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('bg-upload');
    const sizeSelect = document.getElementById('bg-size');
    const positionSelect = document.getElementById('bg-position');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-btn');
    const settingsPanel = document.getElementById('settings-panel');

    // Kiểm tra xem các nút có tồn tại không trước khi gán sự kiện
    if (openBtn && settingsPanel) {
        openBtn.onclick = () => settingsPanel.classList.add('show');
    }
    if (closeBtn && settingsPanel) {
        closeBtn.onclick = () => settingsPanel.classList.remove('show');
    }

    // Logic nén và lưu ảnh (tăng nét, vẫn tối ưu dung lượng)
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

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.92);
                chrome.storage.local.set({ customBackground: compressedBase64 }, () => {
                    window.location.reload(); 
                });
            };
            img.src = URL.createObjectURL(file);
        };
    }

    const saveSettings = () => {
        chrome.storage.local.set({ 
            bgSize: sizeSelect.value, 
            bgPosition: positionSelect.value 
        });
        document.body.style.backgroundSize = sizeSelect.value;
        document.body.style.backgroundPosition = positionSelect.value;
    };

    if (sizeSelect) sizeSelect.onchange = saveSettings;
    if (positionSelect) positionSelect.onchange = saveSettings;
});