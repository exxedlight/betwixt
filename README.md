# Betwixt shell
## 

~ Shell created for Hyprland only.


### Requirements
- aylurs-gtk-shell (AUR)
- libastal-meta (AUR)

### Packages requiremens
- mako
- grim, slurp, grimblast, satty, wf-recorder
- cpupower
- canberra-gtk-play


### Installation and running
- Install required packages
- Download this project and place it somewhere on your disk
- Run it in terminal: *ags run /path/to/app.ts*
- For autostart, print in your _hyprland.lua_: 
```lua
hl.on("hyprland.start", function ()
    hl.exec_cmd("ags run /path/to/app.ts")
    -- ...(your other autostart commands...)
end)
```


### Modules
- Workspaces panel with apps icons
- System state indication
- Apps panel
- Wifi panel
- Bluetooth panel
- Screen capture / translation
- Custom CPU power modes
- 
