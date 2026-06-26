# Unet Browser (beta1)

Unet is a lightweight, high-performance, and minimal desktop web browser built on top of Electron and webview technologies. Designed with a clean interface and optimized resource management, Unet provides a seamless multi-tab browsing experience without overwhelming system memory.

## Features

- **Dynamic Multi-Tab System**: Easily open, close, and switch between tabs dynamically.
- **Smart Window Controls**: Custom borderless window design with sleek minimize, maximize, and close functionalities.
- **Optimized Performance**: Engineered to tackle memory leaks and prevent blank screens (`ERR_ABORTED`) during page initialization.
- **Minimalist Navigation**: Clean URL address bar with quick access to essential navigation tools (Back, Forward, Refresh, and Bookmarks).
- **Lightweight Core**: Uses a customized `<webview>` architecture that starts with a single Google homepage to save initial system resources.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or download this repository to your local machine.
2. Open your terminal in the project directory and install the dependencies:
   ```bash
   npm install

### Running the Application
To launch Unet, run the following command in your terminal: "npm start"

### Tech Stack
1. Framework: Electron
2. Frontend: HTML5, CSS3 (Inter font layout), JavaScript (ES6+)
3. Process Communication: Electron ipcRenderer / ipcMain

### Current Version
1. Developer: Nguyễn Khôi Nguyên
2. GitHub: <NguyenKhoiNguyen-UN>

Thank you for exploring Unet Browser! Feel free to submit issues or feature requests.