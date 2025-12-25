# Image Optimizer CLI (React) 🚀

A browser-based, "CLI-like" image optimization interface built as a React component. This UI simulates batch image compression and conversion workflows with a terminal-style control panel, queue management, and per-run results. It is intended as a demo / frontend for an image optimization workflow — the actual compression and file saving are simulated client-side.

File: `image-optimizer-cli.tsx`

---

## Features

- Drag & select multiple images into a file queue.
- Queue management: add, remove, clear, and list queued files.
- Simulated compression pipeline:
  - Reads images in the browser, calculates a simulated compression ratio and new file size.
  - Reports image dimensions, original format, optimized format, and space saved.
- Results panel showing each optimized file with status and savings.
- Terminal area that logs operations in CLI style with color-coded messages (info, success, error, command).
- Built-in command input supporting:
  - `help` — show available commands
  - `clear` — clear terminal output
  - `reset` — reset app state (queue/results/terminal)
  - `queue` — show files in queue
  - `settings` — show current optimization settings
  - `optimize` — start the optimization process
- Settings panel for customizing:
  - Output format: WebP / AVIF / JPEG / PNG
  - Quality (1–100)
  - Max width / height
  - Keep original (setting present in state; simulated usage)
- Download simulation: "Prepare download package" (note: simulated — no real files are saved on disk).
- Tailwind-friendly layout and lucide-react icons used for UI.

---

## Important notes

- This component simulates compression in-browser — it does not perform real format conversion or produce downloadable optimized files. It uses the FileReader API to read images (data URLs) and calculates a simulated compression ratio to demonstrate the UI and UX.
- For a production-ready optimizer you would connect this UI to a backend optimizer (e.g., Sharp, libvips) or implement real client-side encoding (WebCodecs, Canvas → toBlob, encoding libs for WebP/AVIF) and implement an actual download/zip flow.

---

## Tech / Dependencies

- React (hooks) — component is a functional React component using useState/useRef
- lucide-react — icons used throughout (Zap, Upload, CheckCircle, XCircle, Download, Settings, Trash2, FolderOpen, Info)
- Tailwind CSS classes used in markup (the component assumes Tailwind or compatible styles are available)
- Browser File APIs: FileReader, Image

File path in this repo:
- `image-optimizer-cli.tsx` (component)

Source (component): https://github.com/Zortex-Tech-Solutions/Image-Optimizer-CLI/blob/main/image-optimizer-cli.tsx

---

## Installation / Quick start

1. Clone the repository (or copy the component into your project):

```bash
git clone https://github.com/Zortex-Tech-Solutions/Image-Optimizer-CLI.git
cd Image-Optimizer-CLI
```

2. Install dependencies (example using npm):

```bash
npm install
# or
yarn install
```

3. Ensure your React app has Tailwind (or adapt the styles) and install lucide-react:

```bash
npm install lucide-react
```

4. Import and use the component in your app:

```tsx
import React from 'react';
import ImageOptimizerCLI from './image-optimizer-cli';

function App() {
  return <ImageOptimizerCLI />;
}

export default App;
```

5. Start your dev server:

```bash
npm run start
# or for CRA
npm run dev
```

---

## Usage — UI & CLI commands

Use the UI to add images using the "Add Images" control or by programmatic file input.

Terminal commands (type into the command input and press Enter):

- `help` — list available commands
- `clear` — clears the terminal
- `reset` — resets queue, results, and terminal
- `queue` — prints files currently in the queue
- `settings` — prints current optimization settings
- `optimize` — runs the simulated optimization on queued files

Buttons:
- Optimize Now — starts optimization (same as `optimize` command)
- Download All — simulated "prepare download" action
- Reset All — clears state and resets terminal
- Trash icon — clear queue
- X icon next to each file — remove that file from queue

Settings:
- Quality: 1–100 (higher means better quality and larger output in simulation)
- Format: `webp`, `avif`, `jpg`, `png` (affects the simulated compression factor)
- Max Width / Max Height: numeric fields (displayed in settings and logged during optimization)
- Keep original: flag in state (present but the demo doesn't actually preserve files since saving is simulated)

---

## Extending to a real optimizer

To make this component perform real image conversions and downloads:

- Integrate a server-side image optimizer:
  - Send queued files (FormData) to an API endpoint that runs Sharp/libvips for conversions and resizing.
  - Stream or zip optimized files for download.
- Or implement client-side encoding:
  - Use Canvas / OffscreenCanvas to redraw images and then toBlob with chosen mime type.
  - For AVIF/WebP, consider browser support or WebAssembly encoders.
- Replace the simulated compression logic (simulateCompression) with the real encoding pipeline and proper Blob handling.

---

## Troubleshooting

- Images failing to load in the browser (image.onerror) will be reported as a failed optimization in the terminal.
- Large image files may take time to load and process in the browser — prefer server-side processing for heavy workloads.
- Tailwind classes won't apply if you don't have Tailwind configured — style may look unstyled in that case.

---

## Contributing

Contributions are welcome. Suggested improvements:
- Real encoding and download support
- ZIP/packaging of optimized files
- Progress bars per-file
- Drag & drop file support (if not already provided)
- Unit tests & storybook for the component

Please open a PR against the main repository and follow typical contribution guidelines (create an issue first if the change is large).

---

## License

Add a license to the repository as appropriate (MIT, Apache-2.0, etc.). This README does not include a license by itself.

---
Made with ❤️, and coffee...
**If you want to support the work we do, star this repo!**