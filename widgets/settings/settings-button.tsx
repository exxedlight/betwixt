import { Gtk } from "ags/gtk4";
import { onClick } from "../../lib/core/gestures";
import { settingsWindowVisible, toggleSettingsWindow } from "../../lib/global-states";

export default function SettingsButton(){
    return (
        <centerbox 
            class={settingsWindowVisible.as(v => v ? "settings-button opened" : "settings-button")}
            orientation={Gtk.Orientation.HORIZONTAL}
            $={onClick(() => toggleSettingsWindow())}
        >
            <label
                label=""
                $type="center"
                class="bar-button"
                xalign={0.5}    
            />
        </centerbox>
    )
}