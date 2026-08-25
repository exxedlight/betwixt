import { createPoll } from "ags/time"
import WifiPanelContent from "../../panels/wifi-panel-content"
import { Gtk } from "ags/gtk4"
import RevealerPanel from "../../primitives/revealer-panel"
import { getWifiStatus, setWifiRadio, WifiStatus } from "../../../lib/services/wifi"
import { activeNexusPanel, closeNexusPanel, NexusPanelKey, toggleNexusPanel } from "../../../lib/global-states"
import { onClick } from "../../../lib/core/gestures"

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
    RevealerPanel({
        name: "nexus-wifi-panel",
        visible: activeNexusPanel.as(k => k === NexusPanelKey.WIFI),
        children: <WifiPanelContent onClose={closeNexusPanel} />,
        transition: Gtk.RevealerTransitionType.SWING_UP,
        classes: ["nexus-panel-window"],
        revealerClasses: ["bar-revealer", "nexus-wifi-revealer"]
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
            <label xalign={0.5} label={icon} />
            
        </box>
    )
}