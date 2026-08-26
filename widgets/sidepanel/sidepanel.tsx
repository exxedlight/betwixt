import { Astal, Gtk } from "ags/gtk4"
import { getPrimaryMonitorWidth } from "../../lib/services/monitors"
import WeatherRow from "./weather"
import DateTimeWidget from "./date-time"
import RevealerPanel from "../primitives/revealer-panel"
import { sidepanelVisible, toggleSidepanel } from "../../lib/global-states"
import { onClick } from "../../lib/core/gestures"

const { TOP, BOTTOM, RIGHT } = Astal.WindowAnchor;

export default function SidePanelWindow(){
    return RevealerPanel({
        name: "sidepanel",
        visible: sidepanelVisible.as(v => v),
        children: <SidepanelContent/>,
        anchor: RIGHT | TOP | BOTTOM,
        classes: ["sidepanel"],
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_LEFT,
        revealerClasses: ["sidepanel-revealer"]
    })
}

export function SidepanelButton(){
    return (
        <label 
            cssClasses={["sidebar-button"]}
            label=""
            $={onClick(() => toggleSidepanel())}
        />
    )
}

export function SidepanelContent(){
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