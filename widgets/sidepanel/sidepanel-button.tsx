import { Astal, Gtk } from "ags/gtk4";
import { onClick } from "../../lib/core/gestures";
import { sidepanelVisible, toggleSidepanel } from "../../lib/global-states";
import SidepanelContent from "./sidepanel-content";
import RevealerPanel from "../primitives/revealer-panel";

export default function SidepanelButton(){
    
    RevealerPanel({
        name: "sidepanel",
        visible: sidepanelVisible.as(v => v),
        children: <SidepanelContent/>,
        anchor: Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM,
        classes: ["sidepanel"],
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_LEFT,
        revealerClasses: ["sidepanel-revealer"]
    })
    
    return (
        <label 
            cssClasses={["sidebar-button"]}
            label=""
            $={onClick(() => toggleSidepanel())}
        />
    )
}