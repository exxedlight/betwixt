import { onClick } from "../../lib/core/gestures";
import RevealerPanel from "../modules/primitives/revealer-panel";
import DesktopPanelContent from "./desktop-panel-content";
import { Astal, Gtk } from "ags/gtk4";
import { desktopVisible, toggleDesktop } from "../../lib/global-states";

export default function DesktopButton() {
    
    //  Pop-up panel widget
    RevealerPanel({
        name: "desktop-panel", 
        visible: desktopVisible.as(v => v), 
        children: <DesktopPanelContent/>, 
        anchor: Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM, 
        classes: ["desktop-panel"], 
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_RIGHT, 
        revealerClasses: ["desktop-revealer"]
    })

    return (
        <label
            label=""
            class="desktop-button"
            $={onClick(() => toggleDesktop())}
        />
    )
}