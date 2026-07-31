# Betwixt shell
## 

~ Shell created for Hyprland only.


### Requirements
- aylurs-gtk-shell (AUR)
- libastal-meta (AUR)


### Installation and running
- Install required packages
- Download this project and place it somewhere on your disk
- Run it in terminal: *ags run /path/to/app.ts*
- For autostart, print in your _hyprland.lua_: 
```lua
hl.on("hyprland.start", function ()
    hl.exec_cmd("waybar -c ~/.config/waybar/topbar/config.jsonc -s ~/.config/waybar/topbar/style.css")
    -- ...(your other autostart commands...)
end)
```


### Medules
- Workspaces panel with apps icons
- System state indication
- Apps panel
- Wifi panel
- Bluetooth panel

