# Betwixt shell 

~ *Shell created for Hyprland.*

*!! WorkInProgress !!*


## DEMO
![Bars](./demo/full.png)
![Desktop](./demo/desktop.png)
![Sidepanel](./demo/sidepanel.png)
![PowerMenu](./demo/power_menu.png)
![AppLauncher](./demo/app_launcher.png)
![WiFiPanel](./demo/wifi_panel.png)


## KEY FEATURES
#### Bars & widgets
- Top & bottom bars
- Workspaces tabs with per-app icons driven by regex rules (`configs/workspaces.json`)
- Live system stats: CPU temp / usage / frequency, discrete GPU temp, RAM
- MPRIS player: seekable progress bar, bezier-curve cava
- System tray with styled popovers
- Updates counter: official repos + AUR helper autodetect
#### Panels
- App launcher with live search
- Wi-Fi panel
- Bluetooth panel
- Desktop grid: configurable icon grid with hot reload on config change (`configs/desktop.json`)
- Right side panel: 5-day weather forecast (Open-Meteo), clock, month-navigable calendar
#### Power & automation
- Battery indicator with warning / critical thresholds and per-level custom actions (`configs/battery.json`)
- AC plug / unplug automation: power plan switch + idle daemon control
- Four CPU power modes via powerprofilesctl + cpupower
- hypridle daemon toggle indicator
- Power menu: lock, suspend (with pre-lock), reboot, poweroff, logout
#### Screen tools
- Screen video recording with start / stop sounds (wf-recorder)
- Screenshots: fullscreen / area to clipboard / to file / markup in satty
- Screen-area OCR translation (tesseract + translate-shell) — result to clipboard and notification
#### Quick hub
- Brightness & volume indicators with scroll control
- Mic volume / mute indicator
- Keyboard layout indicator with click-to-switch
#### Customization
- SCSS variable themes + styles hot reload
- Everything tunable via JSON configs (look to `configs/` dir)
- Hyprland keybinds integration via `ags request` (look to `lib/services/actions.ts` file)


## REQUIREMENTS
#### Core
- **`hyprland` -- WM**
- **`aylurs-gtk-shell` **(AUR)** -- AGS v3 (TypeScript-Astal implementation)**
- **`libastal-meta` **(AUR)** -- Astal libraries**
- **`sass`** / **`dart-sass`** **-- styles compiler**
- `curl` -- weather
- `networkmanager` -- WiFi panel
- `pipewire`, `pipewire-pulse`, `wireplumber` -- System sound
#### Screen capture
- `grim`, `slurp`, `wl-clipboard`
- `grimblast-git` -- helper for screenshots within Hyprland
- `satty` -- screenshots markup tool
- `wf-recorder` -- screen video capture
- `tesseract` + `tesseract-data-eng`, `translate-shell` -- screen translation
- `libcanberra` -- shell sounds play
#### System and power
- `power-profiles-daemon` — powerprofilesctl
- `cpupower` -- CPU frequency limits
- `brightnessctl` -- screen brightness
- `hypridle`, `hyprlock` -- idle-daemon and lockscreen
- `pacman-contrib` -- checkupdates for updates counter
- `jq` -- hyprctl parsing in player
- `kitty` -- terminal (if you use other, customize `/widgets/modules/bottom-bar/nexus/updates-button.tsx`, replace Kitty to your terminal. It will be fixed later)
- `pavucontrol` -- sound mixer (optional)
- `nvidia-utils` -- NVidia tool (optional)
#### Fonts
- `otf-commit-mono-nerd`
- `ttf-fantasque-nerd`
- `ttf-meslo-nerd`
- `ttf-nerd-fonts-symbols`
- `ttf-nerd-fonts-symbols-common`
- *or change it in /styles/core/_fonts.scss*
#### Others
- `mako` -- notification daemon (you may use other daemon)
- `audacious` -- music player (or other, but integration is lower. Add you player to array in `configs/player.json`)



## Installation and running
1. Install required packages
2. Download/clone this project and place it somewhere on your disk
3. Look and configure configs inside `configs/` dir
4. Run it in terminal: `ags run /path/to/app.ts & disown`
5. For autostart, add in your `hyprland.lua`: 
```lua
hl.on("hyprland.start", function ()
    hl.exec_cmd("ags run /path/to/app.ts")
    -- ...(your other autostart commands...)
end)
```
OR

4. Make a bundle: `ags bundle /path/to/app.ts /path/to/output_file`
5. Make it executable: `chmod +x /path/to/output_file`
6. Run it in terminal: `/path/to/output_file`
7. For autostart, add in your `hyprland.lua`:
```lua
hl.on("hyprland.start", function ()
    hl.exec_cmd("/path/to/output_file")
    -- ...(your other autostart commands...)
end)
```

## Required configuration
- Look to `configs/{name}_example.json` files and create your own `configs/{name}.json` without *_example* in name. Instruction provided in every such file.


## Hyprland integration
Betwixt uses AGS signals to perform shell actions. Full list of supported actions proveded in */lib/services/actions.ts*

Syntax for _hyprland.lua_ is: `hl.bind({COMBINATION}, hl.dsp.exec_cmd("ags request '{ACTION-NAME}'"))`

Example:
```lua
hl.bind(mainMod .. " + R", hl.dsp.exec_cmd("ags request 'toggle-apps'"))
```