const { app, BrowserWindow, ipcMain, Menu, MenuItem, shell } = require('electron');
const path = require('path');

function createWindow (options = {}) {
  const { incognito = false } = options;
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 640,
    minHeight: 480,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    backgroundMaterial: 'acrylic',
    resizable: true,
    maximizable: true,
    thickFrame: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      devTools: true,
      offscreen: false,
      backgroundThrottling: false,
      partition: incognito ? 'nopersist' : undefined
    }
  });

  if (typeof mainWindow.setBackgroundMaterial === 'function') {
    mainWindow.setBackgroundMaterial('acrylic');
  }

  mainWindow.setOpacity(0);
  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    let opacity = 0;
    const fadeInterval = setInterval(() => {
      opacity += 0.08;
      if (opacity >= 1) {
        mainWindow.setOpacity(1);
        clearInterval(fadeInterval);
      } else {
        mainWindow.setOpacity(opacity);
      }
    }, 16);
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
  });

  mainWindow.on('restore', () => {
    mainWindow.setOpacity(0);
    mainWindow.show();
    let opacity = 0;
    const fadeInterval = setInterval(() => {
      opacity += 0.08;
      if (opacity >= 1) {
        mainWindow.setOpacity(1);
        clearInterval(fadeInterval);
      } else {
        mainWindow.setOpacity(opacity);
      }
    }, 16);
  });

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const fileName = item.getFilename();
    const totalBytes = item.getTotalBytes();

    mainWindow.webContents.send('download-started', { name: fileName, total: totalBytes });

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        mainWindow.webContents.send('download-status', { name: fileName, status: 'Bị gián đoạn' });
      } else if (state === 'progressing') {
        const received = item.getReceivedBytes();
        const progress = totalBytes > 0 ? Math.round((received / totalBytes) * 100) : 0;
        mainWindow.webContents.send('download-status', { name: fileName, status: `Đang tải: ${progress}%` });
      }
    });

    item.on('done', (event, state) => {
      if (state === 'completed') {
        mainWindow.webContents.send('download-status', { name: fileName, status: 'Hoàn thành' });
      } else {
        mainWindow.webContents.send('download-status', { name: fileName, status: `Lỗi: ${state}` });
      }
    });
  });

  ipcMain.handle('open-downloads-folder', async () => {
    const downloadsPath = app.getPath('downloads');
    await shell.openPath(downloadsPath);
    return downloadsPath;
  });

  ipcMain.handle('get-path', (event, name) => {
    return app.getPath(name);
  });

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });
  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  ipcMain.on('open-new-window', (event, opts = {}) => {
    createWindow(opts);
  });
  ipcMain.on('open-incognito-window', () => {
    createWindow({ incognito: true });
  });
}

ipcMain.on('show-context-menu', (event, params) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const menu = new Menu();
  if (params.selectionText && params.selectionText.trim() !== '') {
    menu.append(new MenuItem({
      label: 'Sao chép (Copy)',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }));
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({
      label: `Tìm kiếm "${params.selectionText.substring(0, 15)}..." trên Google`,
      click: () => {
        win.webContents.send('open-search-tab', `https://www.google.com/search?q=${encodeURIComponent(params.selectionText)}`);
      }
    }));
  } else {
    menu.append(new MenuItem({
      label: 'Quay lại (Back)',
      enabled: params.canGoBack,
      click: () => { win.webContents.send('nav-back'); }
    }));
    menu.append(new MenuItem({
      label: 'Chuyển tiếp (Forward)',
      enabled: params.canGoForward,
      click: () => { win.webContents.send('nav-forward'); }
    }));
    menu.append(new MenuItem({
      label: 'Tải lại (Reload)',
      accelerator: 'CmdOrCtrl+R',
      click: () => { win.webContents.send('nav-reload'); }
    }));
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({
      label: 'Lưu thành... (Save As...)',
      accelerator: 'CmdOrCtrl+S',
      click: () => { win.webContents.send('save-page'); }
    }));
    menu.append(new MenuItem({
      label: 'In... (Print)',
      accelerator: 'CmdOrCtrl+P',
      click: () => { win.webContents.send('print-page'); }
    }));
  }

  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({
    label: 'Xem nguồn trang (View Page Source)',
    click: () => { win.webContents.send('view-source'); }
  }));
  menu.append(new MenuItem({
    label: 'Kiểm tra (Inspect)',
    click: () => { win.webContents.send('trigger-f12'); }
  }));

  menu.popup({ window: win });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});