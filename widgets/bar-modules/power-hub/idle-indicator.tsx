import { Gtk } from "ags/gtk4";
import { createComputed, createState } from "ags";
import { idleState, toggleIdleDaemon } from "../../../lib/services/idle";
import { onClick } from "../../../lib/core/gestures";

export default function IdleIndicator(){
    const icons = {
        active: "󱫔",
        passive: "󱎬"
    }
    
    const idleIcon = createComputed(() => idleState() ? icons.active : icons.passive);
    const boxClass = createComputed(() => idleState() ? "idle-indicator active" : "idle-indicator"
    );

    return (
        <centerbox class={boxClass} halign={Gtk.Align.CENTER}>
            <label 
                $type="center" 
                label={idleIcon} 
                xalign={0.5}
                $={onClick(() => toggleIdleDaemon())}
            />
        </centerbox>
    )
}