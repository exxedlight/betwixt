import { createState } from "ags";
import { Gtk } from "ags/gtk4";
import { onClick } from "../../lib/core/gestures";
import { exitHyprland, launchCommand } from "../../lib/services/hyprland-exec";

type Props = {
    onClose?: () => void
}

export default function PowerMenuPanelContent({ onClose }: Props) {
    const [windowVisible, setWindowVisible] = createState(false)

    return (
        <box 
            orientation={Gtk.Orientation.VERTICAL} 
            class="power-menu-box" 
            spacing={5} 
            canFocus={true}
        >

            <label
                label="" xalign={0.5}
                class="close-panel"
                $={onClick(() => onClose?.())}
            />


            <label 
                label="󰌾" xalign={0.5}
                $={onClick(() => launchCommand("setsid hyprlock"))} 
            />
            
            <label 
                label="" xalign={0.5} 
                $={onClick(() => launchCommand("systemctl poweroff"))}    
            />
            
            <label 
                label="󰑓" xalign={0.5} 
                $={onClick(() => launchCommand("systemctl reboot"))}    
            />
            
            <label 
                label="󰍃" xalign={0.5} 
                $={onClick(() => exitHyprland())}
            />
            
            <label 
                label="󰖔" xalign={0.5} 
                $={onClick(() => launchCommand("hyprlock & sleep 0.5; systemctl suspend"))} 
            />
        </box>
    )
}