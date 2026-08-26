import { Astal, Gtk } from "ags/gtk4";
import { onClick } from "../../lib/core/gestures";
import { exitHyprland, launchCommand } from "../../lib/services/hyprland-exec";
import RevealerPanel from "../primitives/revealer-panel";
import { powermenuVisible, setPowermenuVisible } from "../../lib/global-states";

type Props = {
    onClose?: () => void
}

const {TOP, RIGHT} = Astal.WindowAnchor

export default function PowerMenuPanel(){
    return RevealerPanel({
        name: "power-menu-panel",
        visible: powermenuVisible,
        children: <PowerMenuPanelContent onClose={() => setPowermenuVisible(false)} />,
        transition: Gtk.RevealerTransitionType.SWING_DOWN,
        anchor: TOP | RIGHT,
        classes: ["power-menu-panel"],
        revealerClasses: ["power-menu-revealer"]
    })
}

function PowerMenuPanelContent({ onClose }: Props) {
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