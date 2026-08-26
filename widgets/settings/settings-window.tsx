import { Astal, Gtk } from "ags/gtk4"
import { settingsWindowVisible } from "../../lib/global-states"
import RevealerPanel from "../primitives/revealer-panel"

export function SettingsWindow(){
    RevealerPanel({
        name: "settings-window",
        visible: settingsWindowVisible.as(v => v),
        children: <SettingsPanelContent/>,
        anchor: Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT,
        classes: ["settings-window"],
        transition: Gtk.RevealerTransitionType.CROSSFADE,
        revealerClasses: ["settings-window-revealer"]
    })
}

export default function SettingsPanelContent(){
    return (
        <box>
            
        </box>
    )
}