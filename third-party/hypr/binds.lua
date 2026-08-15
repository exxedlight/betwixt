-- ░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓███████▓▒░░▒▓███████▓▒░ 
-- ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▓█▓▒░        
-- ░▒▓█▓▒░▒▓█▓▒░ ▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▓█▓▒░        
-- ░▒▓████▓▒░░   ▒▓██████▓▒░  ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░  
-- ░▒▓█▓▒░▒▓█▓▒░ ▒▓█▓▒░         ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░     ░▒▓█▓▒░ 
-- ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░         ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░     ░▒▓█▓▒░ 
-- ░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░  ░▒▓█▓▒░   ░▒▓███████▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▓███████▓▒░  

--local hl
local terminal    = "kitty"
local fileManager = "thunar"

local mainMod = "SUPER"


-- https://wiki.hypr.land/Configuring/Basics/Binds/
--
hl.bind(mainMod .. " + Q", hl.dsp.exec_cmd(terminal))
hl.bind(mainMod .. " + C", hl.dsp.window.close())
hl.bind(       "ALT + F4", hl.dsp.window.close())
hl.bind(mainMod .. " + E", hl.dsp.exec_cmd(fileManager))
hl.bind(mainMod .. " + F", hl.dsp.window.float({ action = "toggle" }))
-- hl.bind(mainMod .. " + R", hl.dsp.exec_cmd(menu))
hl.bind(mainMod .. " + P", hl.dsp.window.pseudo())
hl.bind(mainMod .. " + J", hl.dsp.layout("togglesplit"))    -- dwindle only

hl.bind(mainMod .. " + L",  hl.dsp.exec_cmd("hyprlock"))
hl.bind(mainMod .. " + F1", hl.dsp.exec_cmd("hyprlock & sleep 0.5; systemctl suspend"), { locked = true })
hl.bind(mainMod .. " + F7", hl.dsp.dpms({action = "toggle"}))



-- Clipboard manager (cliphist)
hl.bind(mainMod .. " + V", hl.dsp.exec_cmd("cliphist list | wofi --dmenu --pre-display-cmd \"echo '%s' | cut -f 2\" | cliphist decode | wl-copy"))
-- Active window opacity toggle
hl.bind(mainMod .. " + O", hl.dsp.window.set_prop({ prop = "opaque", value = "toggle" }))



-- ===================================================================================================
-- Betwixt AGS Shell signals snippet
hl.bind(mainMod .. " + R", hl.dsp.exec_cmd("ags request 'toggle-apps'"))
hl.bind(mainMod .. " + D", hl.dsp.exec_cmd("ags request 'toggle-desktop'"))
hl.bind(mainMod .. " + S", hl.dsp.exec_cmd("ags request 'toggle-sidepanel'"))

--  Betwixt screen capture
hl.bind(mainMod ..  " + F10",           hl.dsp.exec_cmd("ags request 'video-record-toggle'"))
hl.bind(            "PRINT",            hl.dsp.exec_cmd("ags request 'screenshot-full-copy'"))
hl.bind(mainMod ..  " + SHIFT + S",     hl.dsp.exec_cmd("ags request 'screenshot-area-copy'"))
hl.bind(mainMod ..  " + CTRL + S",      hl.dsp.exec_cmd("ags request 'screenshot-area-markup'"))
hl.bind(            "F12",              hl.dsp.exec_cmd("ags request 'screenshot-full-save'"))
hl.bind(mainMod ..  " + SHIFT + T",     hl.dsp.exec_cmd("ags request 'screen-area-translate'"))


-- ===================================================================================================


-- Switch workspaces with mainMod + [0-9]
-- Move active window to a workspace with mainMod + SHIFT + [0-9]
for i = 1, 10 do
    local key = i % 10 -- 10 maps to key 0
    hl.bind(mainMod .. " + " .. key,             hl.dsp.focus({ workspace = i}))
    hl.bind(mainMod .. " + SHIFT + " .. key,     hl.dsp.window.move({ workspace = i }))
end
-- Scroll through existing workspaces with mainMod + scroll
hl.bind(mainMod .. " + mouse_down",         hl.dsp.focus({ workspace = "+1" }))
hl.bind(mainMod .. " + mouse_up",           hl.dsp.focus({ workspace = "-1" }))
hl.bind(mainMod .. " + SHIFT + mouse_down", hl.dsp.window.move({ workspace = "r+1" }))
hl.bind(mainMod .. " + SHIFT + mouse_up",   hl.dsp.window.move({ workspace = "r-1" }))
hl.bind("ALT + TAB",                        hl.dsp.focus({ workspace = "previous" }))


-- Example special workspace (scratchpad)
-- hl.bind(mainMod .. " + D",         hl.dsp.workspace.toggle_special("magic"))
-- hl.bind(mainMod .. " + SHIFT + D", hl.dsp.window.move({ workspace = "special:magic" }))


-- Move/resize windows with mainMod + LMB/RMB and dragging
hl.bind(mainMod .. " + mouse:272", hl.dsp.window.drag(),   { mouse = true })
hl.bind(mainMod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })


-- Laptop multimedia keys for volume and LCD brightness
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+"), { locked = true, repeating = true })
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"),      { locked = true, repeating = true })
hl.bind("XF86AudioMute",        hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"),     { locked = true, repeating = true })
hl.bind("XF86AudioMicMute",     hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"),   { locked = true, repeating = true })
hl.bind("XF86MonBrightnessUp",  hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%+"),                  { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%-"),                 { locked = true, repeating = true })

hl.bind(mainMod .. " + up",    hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+"), { locked = true, repeating = true })
hl.bind(mainMod .. " + down",  hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%-"), { locked = true, repeating = true })
hl.bind(mainMod .. " + left",  hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%-"),                  { locked = true, repeating = true })
hl.bind(mainMod .. " + right", hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%+"),                  { locked = true, repeating = true })


-- Requires playerctl
hl.bind("XF86AudioNext",  hl.dsp.exec_cmd("playerctl next"),       { locked = true })
hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPlay",  hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPrev",  hl.dsp.exec_cmd("playerctl previous"),   { locked = true })
-- Audacious
hl.bind("CTRL + F1",    hl.dsp.exec_cmd("playerctl -p audacious previous"),   { locked = true })
hl.bind("CTRL + SPACE", hl.dsp.exec_cmd("playerctl -p audacious play-pause"), { locked = true })
hl.bind("CTRL + F2",    hl.dsp.exec_cmd("playerctl -p audacious next"),       { locked = true })


-- Btop quick launch
hl.bind(mainMod .. " + SHIFT + ESCAPE", hl.dsp.exec_cmd("kitty -e --class \"btop-primary\" btop -p 1"))
