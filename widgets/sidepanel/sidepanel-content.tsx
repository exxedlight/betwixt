import { Gtk } from "ags/gtk4"
import { getPrimaryMonitorWidth } from "../../lib/services/monitors"
import WeatherRow from "./modules/weather"
import DateTimeWidget from "./modules/date-time"

export default function SidepanelContent(){
    const panelWidth = Math.round(getPrimaryMonitorWidth() * 0.3)
    
    return (
        <box 
            class="sidepanel-content" 
            vexpand 
            widthRequest={panelWidth}
            orientation={Gtk.Orientation.VERTICAL}
            >
            
            <WeatherRow/>
            <DateTimeWidget/>
        </box>
    )
}