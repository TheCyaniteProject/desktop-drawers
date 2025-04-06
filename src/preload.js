const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('api', {
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
  openDevTools: () => ipcRenderer.send('open-devtools'),
  fetchFolderContents: (folderPath) => ipcRenderer.invoke('read-folder', folderPath),
  openItem: (item) => ipcRenderer.invoke('open-item', item),
  newWindow: () => ipcRenderer.send('new-window'),
  updateWindowState: (newPath) => ipcRenderer.send('update-window-state', newPath),
  onSetPath: (callback) => ipcRenderer.on('set-path', (event, path) => callback(path))
});