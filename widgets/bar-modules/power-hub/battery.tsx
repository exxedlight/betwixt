import { createComputed } from "ags";
import { Gtk } from "ags/gtk4";
import { batteryPercent, batteryStateClass } from "../../../lib/services/battery";

export function Battery() {
    const icons = ["󰁺", "󰁻", "󰁼", "󰁽", "󰁾", "󰁿", "󰂀", "󰂁", "󰂂", "󰁹"];
    const chargingIcon = "󰂄";

    const icon = createComputed(() => {
        const percent = batteryPercent()
 
        if (batteryStateClass() == "charging") return chargingIcon;

        const iconIndex = Math.floor((percent / 100) * (icons.length - 1))
        return icons[iconIndex];
    })
 
    const label = createComputed(() => `${icon()} ${batteryPercent()}%`)
    const rootClass = createComputed(() => `battery-indicator ${batteryStateClass()}`.trim())
 
    
    return (
        <centerbox class={rootClass} halign={Gtk.Align.CENTER}>
            <label $type="center" label={label} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} xalign={0.5} />
        </centerbox>
    )
}