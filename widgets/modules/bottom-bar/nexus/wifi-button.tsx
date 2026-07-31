import { createPoll } from "ags/time"
import { onClick } from "../../../../lib/core/gestures"
import { getWifiStatus, setWifiRadio, WifiStatus } from "../../../../lib/services/wifi"
import WifiPanelContent from "./panel-contents/wifi-panel-content"
import NexusPanel from "./core/nexus-panel"
import { Gtk } from "ags/gtk4"
import { activeNexusPanel, closeNexusPanel, NexusPanelKey, toggleNexusPanel } from "../../../../lib/global-states"

export default function WifiButton() {
    const ICONS = ["󰤟", "󰤢", "󰤥", "󰤨"]
    
    const status = createPoll<WifiStatus>(
        { enabled: true, connected: false, strength: 0 },
        3000,
        () => getWifiStatus()
    )

    const icon = status.as((s) => {
        if (!s.enabled) return "󰤮"
        if (!s.connected) return "󰤯"
        return ICONS[Math.min(3, Math.floor(s.strength / 25))]
    })

    //  Pop-up panel widget
    NexusPanel({
        name: "nexus-wifi-panel",
        visible: activeNexusPanel.as(k => k === NexusPanelKey.WIFI),
        children: <WifiPanelContent onClose={closeNexusPanel} />,
        transition: Gtk.RevealerTransitionType.SWING_UP,
        revealerClass: "nexus-wifi-revealer"
    })

    return (
        <box
            cssClasses={["wifi-button", "nexus-button"]}
            $={(self) => {
                onClick({
                    primary: () => toggleNexusPanel(NexusPanelKey.WIFI),
                    secondary: async () => {
                        const currentStatus = await getWifiStatus()
                        setWifiRadio(!currentStatus.enabled)
                    },
                })(self)
            }}
        >
            <label label={icon} />
            
        </box>
    )
}