import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  exitApp: () => ipcRenderer.send('app:exit'),
});
