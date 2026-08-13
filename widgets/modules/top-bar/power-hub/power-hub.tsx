import { Astal, Gtk } from "ags/gtk4"
import { Battery } from "./modules/battery"
import PowerModes from "./modules/power-modes"
import IdleIndicator from "./modules/idle-indicator"
import RevealerPanel from "../../primitives/revealer-panel"
import { powermenuVisibilityToggle, powermenuVisible, setPowermenuVisible } from "../../../../lib/global-states"
import PowerMenuPanelContent from "../panels/powermenu-panel-content"
import { onClick } from "../../../../lib/core/gestures"

//    󰟢

export default function PowerHub(){

    //const [wallpaperTypeBtn, setWallpaperTypeBtn] = createState("󰟢")
    
    //  Pop-up panel widget
    RevealerPanel({
        name: "power-menu-panel",
        visible: powermenuVisible,
        children: <PowerMenuPanelContent onClose={() => setPowermenuVisible(false)} />,
        transition: Gtk.RevealerTransitionType.SWING_DOWN,
        anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
        classes: ["power-menu-panel"],
        revealerClasses: ["power-menu-revealer"]
    })

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} class="power-hub">
            
            {/* <button label={wallpaperTypeBtn} class="wallpaper-button" halign={Gtk.Align.CENTER} /> */}

            <PowerModes/>

            <IdleIndicator/>

            <Battery/>

            <label 
                label="󰤄"
                class={powermenuVisible.as(isOpen => 
                    isOpen ? "power-menu-button menu-opened" : "power-menu-button"
                )}
                halign={Gtk.Align.CENTER} 
                $={onClick(() => powermenuVisibilityToggle())}
            />
        </box>
    )
}