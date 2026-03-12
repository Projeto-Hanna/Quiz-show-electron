import { app, BrowserWindow, ipcMain, Menu, nativeImage, shell } from 'electron';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'public/logo.png')
    : join(__dirname, '../../resources/logo.png');
  const customIcon = nativeImage.createFromPath(iconPath);

  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    icon: customIcon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

ipcMain.on('app:exit', () => {
  app.quit();
});

ipcMain.on('app:open-external', async (_event, url: string) => {
  if (!url) return;

  try {
    await shell.openExternal(url);
  } catch {}
});

Menu.setApplicationMenu(null);

app.whenReady().then(createWindow);

if (process.platform === 'darwin') {
  const image = nativeImage.createFromPath('assets/logo.png');
  app.dock?.setIcon(image);
}
