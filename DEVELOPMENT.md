# Development Guide

## Tech

- [react](https://react.dev/)
- [mobx](https://mobx.js.org/)
- [less](https://lesscss.org/)
- [rsbuild](https://rsbuild.dev/)
- [electronjs](https://www.electronjs.org/)
- [electron-rsbuild](https://github.com/electron-rsbuild/electron-rsbuild)
- [biome](https://biomejs.dev/)
- [music-metadata](https://github.com/Borewit/music-metadata)

## Installation

```bash
git clone git@github.com:AoDev/kaiku.git
cd kaiku
npm install
npm run dev
```

The app should open automatically. If not, check the terminal output for any errors.

## Development Workflow

### Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start development server with hot reload |
| `npm run test`        | Run unit tests with Vitest               |
| `npm run lint`        | Run type checking and linting            |
| `npm run build:mac`   | Build OSX Production app                 |
| `npm run build:linux` | Build and package for Linux              |
| `npm run build:win`   | Build and package for Windows            |

Built packages will be in the `dist/` directory. (eg dmg install file for OSX)

Note: while there are scripts for all platforms, at this time of writing, I have only tested for mac.
Please report any issues.

## Project Structure

```
kaiku-v3/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── electronEventHandler/  # IPC handlers
│   │   ├── config.ts
│   │   ├── main.ts          # Main entry point
│   │   └── window.ts        # Window management
│   ├── preload/             # Electron preload scripts
│   ├── renderer/            # React frontend
│   │   └── src/
│   │       ├── App/         # Main React app components
│   │       ├── stores/      # MobX stores
│   │       ├── ui-framework/ # Custom UI framework
│   │       └── services/    # App services
│   ├── lib/                 # Shared utilities
│   └── types/               # TypeScript type definitions
├── tools/                   # Build tools and utilities
├── resources/               # App icons and assets
└── docs/                    # Documentation
```

## Architecture

### Main Process (`src/main/`)

- **Electron main process** that manages the app lifecycle
- **IPC handlers** for communication with renderer
- **File system operations** for music library scanning
- **Audio file parsing** using music-metadata library

### Renderer (`src/renderer/`)

- **React-based UI** with MobX for state management
- **Custom UI framework** with reusable components
- **Music library management** and playlist functionality
- **Audio playback** using Howler.js or WaveSurfer.js

## Development Features

### Hot Reload

- Main process and renderer automatically reload on changes
- State preservation where possible

### Type Safety

- Full TypeScript implementation
- Custom type guards for runtime validation
- Strict type checking enabled

### Code Quality

- **Biome** for formatting and linting
- **TypeScript** compiler checks
- **Vitest** for unit testing

## Contributing

### Code Style

- Use **TypeScript** (no type assertions)
- Prefer **type guards** for runtime type checking
- Follow existing patterns in the codebase
- Optionally `npm run format` before committing

### Commit Guidelines

- Conventional commits style.

### Pull Requests

- All welcomed.

---

For questions or issues, please open a GitHub issue or check the existing documentation.
