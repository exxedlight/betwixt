import Bluetooth from "gi://AstalBluetooth"
import { createBinding, createComputed } from "ags"
import { NexusPanelKey, toggleNexusPanel } from "../../../lib/global-states"
import { onClick } from "../../../lib/core/gestures"

export default function BluetoothButton() {
    const bluetooth = Bluetooth.get_default()

    const powered = createBinding(bluetooth, "is_powered")
    const connected = createBinding(bluetooth, "is_connected")

    const icon = createComputed(() => {
        if (!powered()) return "󰂲"      // bluetooth-off
        if (connected()) return "󰂱"     // bluetooth-connect
        return "󰂯"                      // bluetooth (on, idle)
    })

    return (
        <box
            cssClasses={["bluetooth-button", "nexus-button"]}
            $={(self) => {
                onClick({
                    primary: () => toggleNexusPanel(NexusPanelKey.BLUETOOTH),
                    secondary: () => {
                        if (bluetooth.adapter) {
                            bluetooth.toggle()
                        }
                    },
                })(self)
            }}
        >
            <label xalign={0.5} label={icon} />
        </box>
    )
}