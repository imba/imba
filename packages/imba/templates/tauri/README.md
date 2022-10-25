# Imba running in Tauri

This is a minimal example of [Imba](https://github.com/imba/imba) running in [Tauri](https://github.com/tauri-apps/tauri), as an alternative to Electron.

## Requirements

1. Follow the [prerequisites for Tauri](https://tauri.app/v1/guides/getting-started/prerequisites)
2. [Verify your install](https://tauri.studio/docs/getting-started/beginning-tutorial#3-check-tauri-info-to-make-sure-everything-is-set-up-properly) by running `npm run tauri info`.
    - Note: If you are not seeing your Rust versions after install, you may need to restart your shell or `source $HOME/.cargo/env`

## Get started

1. Install dependencies: `npm i`
2. Check your Tauri requirements: `npm run tauri info`
3. Run the project with `npm run dev`
4. Once you are ready to package this into a desktop app, run `npm run build`.
