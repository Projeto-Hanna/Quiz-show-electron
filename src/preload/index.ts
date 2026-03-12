import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  exitApp: () => ipcRenderer.send('app:exit'),
  openExternal: (url: string) => ipcRenderer.send('app:open-external', url),
});
