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
        openBtn.onclick = () => settingsPanel.classList.toggle('show');
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

    const closeAllCustomSelects = (except) => {
        document.querySelectorAll('.custom-select.open').forEach((selectEl) => {
            if (selectEl !== except) {
                selectEl.classList.remove('open');
                const trigger = selectEl.querySelector('.custom-select-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            }
        });
    };

    const initCustomSelect = (selectEl) => {
        if (!selectEl) return;
        const wrapper = selectEl.closest('.custom-select');
        if (!wrapper) return;

        const trigger = wrapper.querySelector('.custom-select-trigger');
        const optionsContainer = wrapper.querySelector('.custom-select-options');
        if (!trigger || !optionsContainer) return;

        const renderOptions = () => {
            optionsContainer.innerHTML = '';
            Array.from(selectEl.options).forEach((option) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'custom-select-option';
                btn.textContent = option.textContent;
                btn.dataset.value = option.value;
                btn.setAttribute('role', 'option');
                if (option.selected) btn.classList.add('active');
                btn.addEventListener('click', () => {
                    selectEl.value = option.value;
                    selectEl.dispatchEvent(new Event('change'));
                    wrapper.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                });
                optionsContainer.appendChild(btn);
            });
        };

        const updateDropdownPlacement = () => {
            const triggerRect = trigger.getBoundingClientRect();
            const availableBelow = window.innerHeight - triggerRect.bottom - 12;
            const availableAbove = triggerRect.top - 12;
            const needed = optionsContainer.scrollHeight;
            const openUp = availableBelow < needed && availableAbove > availableBelow;
            wrapper.classList.toggle('open-up', openUp);
        };

        const syncTrigger = () => {
            const selected = selectEl.options[selectEl.selectedIndex];
            trigger.textContent = selected ? selected.textContent : 'Chon';
            optionsContainer.querySelectorAll('.custom-select-option').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.value === selectEl.value);
            });
        };

        renderOptions();
        syncTrigger();

        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = wrapper.classList.toggle('open');
            trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) {
                closeAllCustomSelects(wrapper);
                requestAnimationFrame(updateDropdownPlacement);
            }
        });

        selectEl.addEventListener('change', () => {
            syncTrigger();
            saveSettings();
        });
    };

    initCustomSelect(sizeSelect);
    initCustomSelect(positionSelect);

    document.addEventListener('click', () => closeAllCustomSelects());
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAllCustomSelects();
    });
    window.addEventListener('resize', () => closeAllCustomSelects());
});