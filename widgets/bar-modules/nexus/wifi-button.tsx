import { createPoll } from "ags/time"
import { getWifiStatus, setWifiRadio, WifiStatus } from "../../../lib/services/wifi"
import { NexusPanelKey, toggleNexusPanel } from "../../../lib/global-states"
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