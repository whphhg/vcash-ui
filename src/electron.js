import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { format } from 'url'
import daemon from './daemon'

/** Keep a global reference of the window object. */
let mainWindow = null

/** Ready to load the GUI. */
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 700,
    icon: join(__dirname, 'assets', 'images', 'logoRed.png'),
    webPreferences: { experimentalFeatures: true },
    width: 1152
  })

  /** Hide browser's menu bar. */
  mainWindow.setMenu(null)

  /** Load the GUI starting point. */
  mainWindow.loadURL(format({
    pathname: join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  /** Open Chromium DevTools in dev mode. */
  process.env.NODE_ENV === 'dev' && mainWindow.webContents.openDevTools()

  /** Open external links using OS default browser. */
  mainWindow.webContents.on('new-window', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  /** Main window closed. */
  mainWindow.on('closed', () => {
    if (daemon !== null) {
      daemon.kill('SIGINT')
    }

    /**
     * Dereference the window object, usually you would store windows
     * in an array if your app supports multi windows, this is the time
     * when you should delete the corresponding element.
     */
    mainWindow = null
  })
})

/** All of the windows are closed. */
app.on('window-all-closed', () => {
  /**
   * On macOS it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q.
   */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})