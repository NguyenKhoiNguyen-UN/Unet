// file: preload.js
// Đoạn này sẽ chạy trực tiếp BÊN TRONG trang web của tab để bắt phím F12
window.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
        // Gửi tín hiệu F12 ra ngoài giao diện chính (index.html)
        const { ipcRenderer } = require('electron');
        ipcRenderer.sendToHost('open-webview-devtools');
    }
});