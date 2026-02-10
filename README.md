# StemRoller Next

StemRoller Next is the next generation of StemRoller, the free app that lets you separate vocal and instrumental stems from any song with a single click. Built on Facebook's [Demucs](https://github.com/facebookresearch/demucs) algorithm with integrated YouTube search.

### What's new in StemRoller Next

- **Apple Silicon native support** — runs natively on arm64 Macs with MPS GPU acceleration
- **No more frozen binaries** — uses a bundled standalone Python runtime with pip-installed Demucs, making updates and maintenance easier
- **Universal architecture** — builds for macOS x64, macOS arm64, and Windows from a single codebase

Simply type the name/artist of any song into the search bar and click the **Split** button that appears in the results! You'll need to wait several minutes for splitting to complete. Once stems have been extracted, you'll see an **Open** button next to the song - click that to access your stems!

## Install Dependencies

```
git clone https://github.com/danczar/stemroller-next.git
cd stemroller-next
npm i -D
```

### Windows/macOS

`npm run download-third-party-apps`

This downloads a standalone Python runtime, installs Demucs via pip, and fetches ffmpeg and yt-dlp. On macOS, set `STEMROLLER_TARGET_ARCH=arm64` or `STEMROLLER_TARGET_ARCH=x64` to target a specific architecture.

### Linux (Not officially supported)

TBD

## Run in Development Mode

`npm run dev`

## Run in Production Mode

`npm run build:svelte && npm run start`

## Production Build

### Windows

`npm run build:win`

### macOS

```
npm run build:mac:arm64   # Apple Silicon
npm run build:mac:x64     # Intel
npm run build:mac         # current architecture
```

## License

Your choice of Public Domain (Unlicense) or MIT No Attribution - please read the [LICENSE](https://github.com/danczar/stemroller-next/blob/main/LICENSE) file for more information.
