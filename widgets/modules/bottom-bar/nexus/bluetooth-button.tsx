import Bluetooth from "gi://AstalBluetooth"
import { createBinding, createComputed } from "ags"
import { onClick } from "../../../../lib/core/gestures"
import NexusPanel from "./core/nexus-panel"
import { Gtk } from "ags/gtk4"
import { activeNexusPanel, closeNexusPanel, NexusPanelKey, toggleNexusPanel } from "../../../../lib/global-states"
import BluetoothPanelContent from "./panel-contents/bluetooth-panel-content"

export default function BluetoothButton() {
    const bluetooth = Bluetooth.get_default()

    const powered = createBinding(bluetooth, "is_powered")
    const connected = createBinding(bluetooth, "is_connected")

    const icon = createComputed(() => {
        if (!powered()) return "󰂲"      // bluetooth-off
        if (connected()) return "󰂱"     // bluetooth-connect
        return "󰂯"                      // bluetooth (on, idle)
    })

    //  Pop-up panel widget
    NexusPanel({
        name: "nexus-bluetooth-panel",
        visible: activeNexusPanel.as(k => k === NexusPanelKey.BLUETOOTH),
        children: <BluetoothPanelContent onClose={closeNexusPanel} />,
        transition: Gtk.RevealerTransitionType.SWING_UP,
        revealerClass: "nexus-bluetooth-revealer"
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
            <label label={icon} />
        </box>
    )
}