import { Gtk } from "ags/gtk4"
import { Battery } from "./battery"
import PowerModes from "./power-modes"
import IdleIndicator from "./idle-indicator"
import { powermenuVisibilityToggle, powermenuVisible } from "../../../lib/global-states"
import { onClick } from "../../../lib/core/gestures"
import { SidepanelButton } from "../../sidepanel/sidepanel"

//    󰟢

export default function PowerHub(){
    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} class="power-hub">

            <PowerModes/>
            <IdleIndicator/>
            <SidepanelButton/>
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