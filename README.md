<img src="https://github.com/SenshiSentou/sd-webui-state-manager/blob/V2.0-beta/toma-chan.png" width="300">

<img src="https://github.com/SenshiSentou/sd-webui-state-manager/blob/main/preview-docked.png" width="400" />
<img src="https://github.com/SenshiSentou/sd-webui-state-manager/blob/main/preview-modal.png" width="400" />

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/J3J81VHA2)

# [W.I.P.] This extension is in open beta!

Please be aware that this extension has not been thoroughly tested yet. If you notice any bugs, please raise an issue here on github or message me on Discord (`blue.tomato`).

# State Manager

After trying a number of history/ state management extensions, I found they all suffered from one of more of these problems:

- Bad UI/UX
- Not saving the entire state
- Just plain not working

I tried to solve these issues by creating an extension that scrapes and restores the entire state as best as possible, including quicksettings (checkpoint, VAE, clip skip are common ones), generation settings (samples, size, seed, etc.), and script and accordion settings.

# Usage

This extension adds two buttons to the top of A1111. The first (⌛⚙) opens the state browser; here you can view and manage your generation history and favourites. The browser opens as a side drawer by default, but can be opened as a full-screen modal window as well.

Clicking on an entry will show its settings in the inspector, and you can apply settings to your current workspace per-setting or per-category using the designated buttons, or you can apply all of them by double-clicking the entry instead.

You can also multi-select entries by holding `ctrl` or the meta key (`⌘` on MacOS), or range select by holding shift.

By default auto-save is on, and every time you generate an image in either txt2img or img2img the state is saved to the history, and a small 100x100 thumbnail is saved alongside it.

If you'd rather save your entries manually, just turn off the toggle in the state browser panel, and use the second button on the top (⌛💾) to add them that way.

# Installation

Open your A1111 Web UI and go to `Extensions > Install from URL`. Paste in the link to this repo (`https://github.com/SenshiSentou/sd-webui-state-manager.git`), click `Install` and restart the web ui. Badabing badaboom, baby!

# Changelog

<details>
  <summary>Click to expand</summary>
  
  ## 2.0
  - Completely overhauled the way settings are saved and loaded (much more robust now) **V2.0 is NOT backwards compatible with V1**
  - Added settings panel (`Settings > State Manager`) that contains:
    - Option to save entries in either a browser's Indexed DB, or a shared .txt file 
    - Tools to migrate data between the different save locations
  - Added API. Mostly meant for internal use, but also contains a `/version` endpoint and some other programmatic access. See `[a1111 ip]:[port]/docs`
  - Made data store more efficiently
  - Improved (error) logging
  - Fixed "delete entry" button not working
  - Ported the code to typescript
</details>