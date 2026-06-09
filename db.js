// db.js
const DB_NAME = 'ChromeHomepageDB';
const STORE_NAME = 'backgrounds';

function initDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

window.saveImageBlob = function(blob) {
    return initDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(blob, 'customImage');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    });
};

window.loadImageBlob = function() {
    return initDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get('customImage');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    });
};
