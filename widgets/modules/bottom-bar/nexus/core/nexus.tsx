import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4"
import WifiButton from "../wifi-button"
import { onClick } from "../../../../../lib/core/gestures"
import AppsPanelContent from "../panel-contents/apps-panel-content"
import { activeNexusPanel, closeNexusPanel, NexusPanelKey, toggleNexusPanel } from "../../../../../lib/global-states"
import BluetoothButton from "../bluetooth-button"
import {
    getGpuAvailable,
    getGpuTemp,
    getCpuTemp,
    getCpuUsage,
    getCpuFreq,
    getMemory,
} from "../../../../../lib/core/system-stats"
import RevealerPanel from "../../../primitives/revealer-panel"
import UpdateButton from "../updates-button"


type Stats = {
    cpuTemp: number | null
    cpuUsage: number | null
    cpuFreq: number | null
    memory: { used: number; total: number } | null
}

export default function Nexus() {
    const gpuAvailable = createPoll(false, 5000, () => getGpuAvailable())
    const gpuTemp = createPoll<number | null>(null, 2000, () => getGpuTemp())

    const stats = createPoll<Stats>(
        { cpuTemp: null, cpuUsage: null, cpuFreq: null, memory: null },
        1000,
        () => ({
            cpuTemp: getCpuTemp(),
            cpuUsage: getCpuUsage(),
            cpuFreq: getCpuFreq(),
            memory: getMemory(),
        })
    )

    const time = createPoll("", 1000, () => new Date().toLocaleTimeString("ru-RU", { hour12: false }))
    const date = createPoll("", 60_000, () => {
            const d = new Date()
            const dayMonth = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
            const weekday = d.toLocaleDateString("en-US", { weekday: "short" })
            return `${dayMonth} ${weekday}`
        }
    )

    //  Pop-up panel widget (APPS)
    RevealerPanel({
        name: "nexus-apps-panel",
        visible: activeNexusPanel.as((k) => k === NexusPanelKey.APPS),
        children: <AppsPanelContent onClose={closeNexusPanel} />,
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_UP,
        classes: ["nexus-panel-window"],
        revealerClasses: ["bar-revealer", "nexus-apps-revealer"]
    })


    return (
        <box class="nexus" spacing={6}>

            <box class="left">
                <label label="󰻇" 
                    class={gpuAvailable.as((a) => (a ? "gpu-icon available" : "gpu-icon unavailable"))} 
                    halign={Gtk.Align.CENTER}
                    xalign={0}
                />
                <label label={gpuTemp.as((t) => (t !== null ? `󱃃 ${t}°C` : "󱃃 --°C"))} 
                    class="temp-gpu" 
                />
                <label label={stats.as((s) => (s.cpuTemp !== null ? `󱃃 ${s.cpuTemp}°C` : "󱃃 --°C"))} 
                    class="temp-cpu" 
                />
                <label label={stats.as((s) => `󰍛 ${s.cpuUsage ?? "---"}%`)} 
                    xalign={0} 
                    class="cpu" 
                    widthRequest={60} 
                />
                <label label={stats.as((s) => (s.cpuFreq !== null ? `${s.cpuFreq}` : "--"))} 
                    class="small" 
                    valign={Gtk.Align.END}
                />
            </box>

            <box class="center">
                <label class="ram" label={stats.as((s) => s.memory ? `󰘚 ${s.memory.used.toFixed(1)} GB` : "--" )} valign={Gtk.Align.END}/>
                <label label={stats.as((s) => s.memory ? `${s.memory.total.toFixed(1)}` : "--")} class="small" valign={Gtk.Align.END} />
                <label
                    label="󰣇"
                    class="menu-button"
                    halign={Gtk.Align.CENTER} 
                    $={(self) => {
                        onClick({
                            primary: () => toggleNexusPanel(NexusPanelKey.APPS),
                        })(self)
                    }}
                />
                
                <label class="time" label={time}/>
            </box>

            <box class="right">
                <label class="date" label={date.as(v => `󰸗 ${v}`)}/>

                <WifiButton />
                <BluetoothButton/>
                <UpdateButton/>
            </box>

        </box>
    )
}