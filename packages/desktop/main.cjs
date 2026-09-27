const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function loadIndex() {
    const module = await import(pathToFileURL(path.join(__dirname, 'resolveDist.js')).href);
    return module.resolveIndexUrl(module.resolveDistIndex());
}

function createWindow() {
    const window = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 960,
        minHeight: 640,
        backgroundColor: '#121212',
        title: 'Glbify',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    loadIndex()
        .then((url) => window.loadURL(url))
        .catch((error) => {
            window.loadURL(
                `data:text/html;charset=utf-8,${encodeURIComponent(
                    `<h1>Glbify</h1><pre>${error.message}</pre>`,
                )}`,
            );
        });

    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    return window;
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
