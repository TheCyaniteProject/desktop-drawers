const mommy = require('node-mommy'); // Don't touch this, this just adds funny messages to console.log and console.error
const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('fs');
const mime = require('mime-types');

const stateFile = path.join(app.getPath('userData'), 'window-states.json');
let windows = new Map();
let isQuitting = false;

function loadWindowStates() {
  try {
    if (fs.existsSync(stateFile)) {
      const raw = fs.readFileSync(stateFile);
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load window states:", e);
  }
  return [];
}

function saveWindowStates() {
  const states = [];
  windows.forEach(({ state }) => {
    if (state) states.push(state);
  });
  try {
    fs.writeFileSync(stateFile, JSON.stringify(states, null, 2));
  } catch (e) {
    console.error("Failed to save window states:", e);
  }
}


function createWindow(savedState) {
  let opts = {
    height: 250,
    width: 500,
    skipTaskbar: true,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Desktop Drawers'
  };
  if (savedState) {
    opts.x = savedState.x;
    opts.y = savedState.y;
    opts.width = savedState.width;
    opts.height = savedState.height;
  }
  const win = new BrowserWindow(opts);
  win.loadFile('index.html');
  win.webContents.on('did-finish-load', () => {
    if (savedState && savedState.path) {
      win.webContents.send('set-path', savedState.path);
    }
  });

  function updateState() {
    const bounds = win.getBounds();
    let state = windows.get(win.id)?.state || {};
    state.x = bounds.x;
    state.y = bounds.y;
    state.width = bounds.width;
    state.height = bounds.height;
    windows.set(win.id, { win: win, state: state });
    saveWindowStates();
  }
  win.on('move', updateState);
  win.on('resize', updateState);
  win.on('close', () => {
    if (!isQuitting) {
      windows.delete(win.id);
    } else {
      const bounds = win.getBounds();
      let state = windows.get(win.id)?.state || {};
      state.x = bounds.x;
      state.y = bounds.y;
      state.width = bounds.width;
      state.height = bounds.height;
      windows.set(win.id, { win: win, state: state });
    }
    saveWindowStates();
  });
  const initialBounds = win.getBounds();
  let initialState = Object.assign({}, savedState || {}, initialBounds, { path: savedState ? savedState.path : '' });
  windows.set(win.id, { win: win, state: initialState });
  saveWindowStates();
  return win;
}

ipcMain.on('minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});
ipcMain.on('close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});
ipcMain.on('open-devtools', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.webContents.openDevTools();
});

ipcMain.handle('read-folder', async (event, folderPath) => {
    try {
      const files = await fs.promises.readdir(folderPath);
      const items = await Promise.all(
        files.map(async file => {
          const fullPath = path.join(folderPath, file);
          const stats = await fs.promises.lstat(fullPath);
          //if (!stats.isDirectory()) console.log(file, mime.lookup(file)); // Debug
          return {
            name: file,
            type: stats.isDirectory() ? 'folder' : mime.lookup(file),
            path: fullPath
          };
        })
      );
      return items;
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle('open-parent', async (event, folderPath) => {
    try {
      await shell.openPath(folderPath);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });
  
  ipcMain.handle('open-item', async (event, item) => {
    try {
      await shell.openPath(item.path);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  let tray;
  app.whenReady().then(() => {
    const states = loadWindowStates();
    if (states.length) {
      states.forEach(savedState => { createWindow(savedState); });
    } else {
      createWindow();
    }
    
    const trayIconPath = path.join(__dirname, 'icon.png');
    const trayIcon = nativeImage.createFromPath(trayIconPath);
    tray = new Tray(trayIcon);

    trayContextMenu = Menu.buildFromTemplate([
        {
            label: "Hide/Show All",
            click: () => {
            const allWindows = BrowserWindow.getAllWindows();
            const anyVisible = allWindows.some(win => win.isVisible());
            allWindows.forEach(win => {
                anyVisible ? win.hide() : win.show();
            });
            }
        },
        {
            label: "New Window",
            click: () => { createWindow(); }
        },
        {
            label: "Quit",
            click: () => {
            isQuitting = true;

            BrowserWindow.getAllWindows().forEach(win => {
                const bounds = win.getBounds();
                let state = windows.get(win.id)?.state || {};
                state.x = bounds.x;
                state.y = bounds.y;
                state.width = bounds.width;
                state.height = bounds.height;
                windows.set(win.id, { win: win, state: state });
            });
            saveWindowStates();
            app.quit();
            }
        }
    ]);
    
    tray.setToolTip("Desktop Drawers");
    tray.setContextMenu(trayContextMenu);
  });

ipcMain.on('new-window', () => {
  createWindow();
});

ipcMain.on('update-window-state', (event, newPath) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const bounds = win.getBounds();
    let state = windows.get(win.id)?.state || {};
    state.x = bounds.x;
    state.y = bounds.y;
    state.width = bounds.width;
    state.height = bounds.height;
    state.path = newPath;
    windows.set(win.id, { win: win, state: state });
    saveWindowStates();
  }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
