# Desktop Drawers

Desktop Drawers is a lightweight, Electron-based desktop file explorer that lets you open multiple frameless windows ("drawers") to easily view and navigate folder contents on your desktop.

![image](https://github.com/user-attachments/assets/e6752341-ed2c-42bd-9c8a-0bed65f289e3)

## Features

- **Multi-Window Drawers:**  
  Open multiple windows, each acting as an independent “drawer” for a specific folder path.
  
- **Persistent State:**  
  Each window automatically saves its position, size, and last accessed folder. On relaunch, all windows are restored to their previous state.
  
- **System Tray Integration:**  
  The app places an icon in the system tray providing a context menu with options:
  - Hide/Show All: Toggle visibility of all open drawers.
  - New Window: Spawn a new drawer.
  - Quit: Exit the app while saving current states.
  
- **Modern UI:**  
  A sleek, transparent interface using frameless windows and Google Material Design icons for a minimal look.
  
- **Files & Folders Display:**  
  Each drawer displays the contents of a folder. Clicking on an item will open it in the default system application.

## Installation

**Windows (binary)**
1. Download the latest [release](https://github.com/TheCyaniteProject/desktop-drawers/releases)

2. Extract entire archive and run `desktop-drawers_xxx_win32-x64.exe`

**Linux/OSX/Windows (from source)**

1. Clone the repository:
   ```
   git clone https://github.com/thecyaniteproject/desktop-drawers.git
   ```

2. Install dependencies:
   ```
   cd src
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

## Usage

- **Editing the Folder Path:**  
  In any drawer, edit the folder path at the top. When you press Enter or the refresh icon, the drawer loads the directory contents.

- **Interacting with Files and Folders:**  
  Each folder and file are represented using their relivant icons. Click an item to open it with its default application.

- **System Tray Controls:**  
  Right-click (or click) the system tray icon to reveal the context menu with the following commands:
  - **Hide/Show All:** Toggles the visibility of all open drawers.
  - **New Window:** Spawns a brand-new drawer.
  - **Quit:** Saves all current window states and exits the app.

## Project Structure

```
desktop-drawers/src/
├── main.js         # Main process: handles window creation, state persistence, system tray integration, and IPC.
├── preload.js      # Preload script: safely exposes selective Electron APIs to the renderer.
├── index.html      # Renderer: HTML/CSS/JS for the drawer window UI.
├── package.json    # Project metadata and Electron configuration.
└── icon.png        # Tray icon image.
```

## Contributing

Contributions, bug reports, and feature suggestions are always welcome! Feel free to fork the repository, create feature branches, and open pull requests.

## License

This project is licensed under the GPL v3.0 License. See the [LICENSE](LICENSE) file for details.

## Contact

For support, please open an issue on GitHub and I'll respond as soon as I see it.

Happy organizing with Desktop Drawers!
