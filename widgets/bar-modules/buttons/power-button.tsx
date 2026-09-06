import { Gtk } from "ags/gtk4";
import { powermenuVisibilityToggle, powermenuVisible } from "../../../lib/global-states";
import { onClick } from "../../../lib/core/gestures";

export default function PowerButton() {
    return (
        <centerbox
            orientation={Gtk.Orientation.HORIZONTAL}
            class={powermenuVisible.as(v => v ? "power-menu-button opened" : "power-menu-button")}
            $={onClick(() => powermenuVisibilityToggle())}
        >
            <label
                label="󰤄"
                class="bar-button"
                $type="center"
                xalign={0.5}
            />
        </centerbox>
    )
}