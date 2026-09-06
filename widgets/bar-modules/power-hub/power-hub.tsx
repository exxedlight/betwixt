import { Gtk } from "ags/gtk4"
import { Battery } from "./battery"
import PowerModes from "./power-modes"
import IdleIndicator from "./idle-indicator"

//    󰟢

export default function PowerHub(){
    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} class="power-hub">

            <PowerModes/>
            <IdleIndicator/>
            <Battery/>
        </box>
    )
}