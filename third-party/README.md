# Third-party configs

Useful configs for third-party tools, styled to match Betwixt.
These are my own configs, use them as-is or as a reference.

| Folder in repo        | Target path             | Note               |
|-----------------------|-------------------------|--------------------|
| `mako/`               | `~/.config/mako/`       | Sound path         |
| `hypr/`               | `~/.config/hypr/`       | Reference only     |
| `fastfetch/`          | `~/.config/fastfetch`   | Wallpaper path     |
| `fonts/`              | `~/.local/share/fonts/` | Optional           |
| `icons/`              | `~/.local/share/icons/` | Cursor only        |
| `themes/`             | `~/.local/share/themes/`| GTK, Kvantum       |


### Mako
- **Replace the notification sound path** inside the config.
- You may change the notification anchor to your liking.

### Hypr
- Use as a reference for your own config.
- `binds.lua` contains `ags request` signal examples.
- `hyprland.lua` contains an autostart example.

### Fastfetch
- My fastfetch config for Kitty.
- Replace wallpaper path inside config file.

### Fonts
- Some of my fonts, installed manually. May be useful, idk.
- After paste, run `fc-cache -f` to update the font cache.

### Icons
- Currently, there is only `Future-cyan-cursors`
- To apply it:
  - place folder into `~/.local/share/icons/`
  - use `hl.env("XCURSOR_THEME", "Future-cyan-cursors")` inside your `hyprland.lua`.
  - Set cursor size with `hl.env("XCURSOR_SIZE", "18")`, `hl.env("HYPRCURSOR_SIZE", "18")`
  - reload session


### Themes
- Two violet themes which I currently using. They seem to go well together ;)
- **GTK**
  - Place **_UltraViolet Squared_** and **_UltraViolet Rounded_** to `~/.local/share/themes`
  - Apply one of it with `nwg-look`
- **QT**
  - Pick **_Viola-Dark-Kvantum_** directory by `kvantum` and install theme, then apply it
  - You don't need to place this to any path or store this folder anymore, when it already installed
- **Dialogs**
  - You need to have `qt6ct`. Run it and choose `GTK3` inside **_Standard dialogs_** dropdown.
  - Add `hl.env("QT_QPA_PLATFORMTHEME", "qt6ct")` to your `hyprland.lua`, restart the session.

