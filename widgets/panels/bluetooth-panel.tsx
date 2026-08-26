import { Gtk } from "ags/gtk4";
import Bluetooth from "gi://AstalBluetooth"
import { createBinding, For } from "ags"
import RevealerPanel from "../primitives/revealer-panel";
import { activeNexusPanel, closeNexusPanel, NexusPanelKey } from "../../lib/global-states";

type Props = {
    onClose: () => void
}

export default function BluetoothPanel(){
    return RevealerPanel({
        name: "nexus-bluetooth-panel",
        visible: activeNexusPanel.as(k => k === NexusPanelKey.BLUETOOTH),
        children: <BluetoothPanelContent onClose={closeNexusPanel} />,
        transition: Gtk.RevealerTransitionType.SWING_UP,
        classes: ["nexus-panel-window"],
        revealerClasses: ["bar-revealer", "nexus-bluetooth-revealer"]
    })
}

function BluetoothPanelContent({ onClose }: Props) {
    const bluetooth = Bluetooth.get_default()
    const devices = createBinding(bluetooth, "devices")

    const toggleConnection = async (device: Bluetooth.Device) => {
        try {
            if (device.connected) {
                await device.disconnect_device()
            } else {
                if (!device.paired) device.pair()
                await device.connect_device()
            }
        } catch (err) {
            logError(err as Error, "bluetooth connect")
        }
    }

    return (
        <box
            class="bluetooth-panel"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
            $={(self) => {
                // scan, while panel visible
                self.connect("map", () => bluetooth.adapter?.start_discovery())
                self.connect("unmap", () => bluetooth.adapter?.stop_discovery())
            }}
        >
            <centerbox class="header">
                <label $type="start" label="Bluetooth Devices" class="panel-title" />
                <button class="close-button" $type="end" label="" onClicked={onClose} />
            </centerbox>

            <box class="bluetooth-table-header" spacing={0}>
                <label label="ADDRESS" class="col-address" xalign={0} />
                <label label="NAME" class="col-name" xalign={0} hexpand />
                <label label="STATUS" class="col-status" xalign={0} />
            </box>

            <scrolledwindow
                class="bluetooth-devices-scroll"
                vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                hscrollbarPolicy={Gtk.PolicyType.NEVER}
                heightRequest={200}
            >
                <box class="items-box" orientation={Gtk.Orientation.VERTICAL} spacing={2}>
                    <For each={devices}>
                        {(device) => {
                            const connected = createBinding(device, "connected")
                            const paired = createBinding(device, "paired")

                            return (
                                <button
                                    class={connected.as(c => c ? "bluetooth-device-item active" : "bluetooth-device-item")}
                                    onClicked={() => toggleConnection(device)}
                                >
                                    <box>
                                        <label label={device.address} class="col-address" xalign={0} />
                                        <label label={device.alias} class="col-name" xalign={0} hexpand />
                                        <label
                                            label={connected.as(c => c ? "Connected" : paired.get() ? "Paired" : "")}
                                            class="col-status"
                                            xalign={0}
                                        />
                                    </box>
                                </button>
                            )
                        }}
                    </For>
                </box>
            </scrolledwindow>
        </box>
    )
}