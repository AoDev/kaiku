import {join} from 'node:path'
import {is} from '@electron-toolkit/utils'
import {BrowserWindow, screen, shell} from 'electron'

export function createWindow(): BrowserWindow {
  // Get the primary display's size
  const primaryDisplay = screen.getPrimaryDisplay()
  const {width: screenWidth, height: screenHeight} = primaryDisplay.workAreaSize

  // Determine window settings based on screen width and height
  const windowOptions = {
    width: screenWidth > 1600 ? 1600 : screenWidth,
    height: screenHeight > 982 ? 982 : screenHeight,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  }

  const mainWindow = new BrowserWindow(windowOptions)

  // If screen dimensions are larger than our limits, center the window
  if (screenWidth > 1600 || screenHeight > 900) {
    mainWindow.center()
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {action: 'deny'}
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
