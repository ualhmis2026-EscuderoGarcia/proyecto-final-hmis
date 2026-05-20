const { app, BrowserWindow, dialog } = require('electron');
const path = require('path'); 
const { autoUpdater } = require('electron-updater'); 

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: true }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(() => {
  createWindow();

  // Iniciar búsqueda de actualizaciones si la app está empaquetada
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// --- Eventos de Auto-Updater ---

autoUpdater.on('checking-for-update', () => {
  console.log('Buscando actualizaciones...');
});

autoUpdater.on('update-available', (info) => {
  console.log('¡Nueva versión disponible!');
  // Opcional: Avisar que se está descargando
});

autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización lista',
    message: `Una nueva versión (${info.version}) ha sido descargada. ¿Quieres reiniciar la aplicación para aplicar los cambios ahora?`,
    buttons: ['Reiniciar ahora', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.error('Error en el auto-updater: ', err);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});