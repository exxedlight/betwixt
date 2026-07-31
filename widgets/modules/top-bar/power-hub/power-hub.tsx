import { Gtk } from "ags/gtk4"
import { createState } from "gnim"
import { Battery } from "./elements/battery"
import PowerModes from "./elements/power-modes"

export default function PowerHub(){
    
    //    󰟢
    //  󱈑  󰾅 󱐌 󱫔 󱎬 

    //  "󰂎", "󰁻", "󰁼", "󰁽", "󰁾", "󰁿", "󰂀", "󰂁", "󰂂", "󰁹"
    //  󰉁

    const [wallpaperTypeBtn, setWallpaperTypeBtn] = createState("󰟢")
    

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} class="power-hub">
            
            <button label={wallpaperTypeBtn} class="wallpaper-button" halign={Gtk.Align.CENTER} />

            <PowerModes/>
            <Battery/>

            <button label="󰤄" class="power-menu-button" halign={Gtk.Align.CENTER} />
        </box>
    )
}