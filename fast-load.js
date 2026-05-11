// fast-load.js
chrome.storage.local.get(['customBackground', 'bgSize', 'bgPosition'], (res) => {
    if (res.customBackground) {
        // Sử dụng kĩ thuật Blob URL để render nhanh hơn Base64
        fetch(res.customBackground)
            .then(r => r.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                document.body.style.backgroundImage = `url(${url})`;
                if (res.bgSize) document.body.style.backgroundSize = res.bgSize;
                if (res.bgPosition) document.body.style.backgroundPosition = res.bgPosition;
                document.body.classList.add('loaded');
            })
            .catch(() => document.body.classList.add('loaded'));
    } else {
        document.body.classList.add('loaded');
    }
});