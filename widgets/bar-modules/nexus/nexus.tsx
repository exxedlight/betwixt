import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4"
import { getCpuFreq, getCpuTemp, getCpuUsage, getGpuAvailable, getGpuTemp, getMemory } from "../../../lib/core/system-stats"
import { NexusPanelKey, toggleNexusPanel } from "../../../lib/global-states"
import { onClick } from "../../../lib/core/gestures"
import { CurrentDate, CurrentTime } from "../../../lib/services/date-time"
import WifiButton from "./wifi-button"
import BluetoothButton from "./bluetooth-button"
import UpdateButton from "./updates-button"


type Stats = {
    cpuTemp: number | null
    cpuUsage: number | null
    cpuFreq: number | null
    memory: { used: number; total: number } | null
}

export default function Nexus() {
    const gpuAvailable = createPoll(false, 5000, async () => await getGpuAvailable())
    const gpuTemp = createPoll<number | null>(null, 2000, async () => await getGpuTemp())

    const stats = createPoll<Stats>(
        { cpuTemp: null, cpuUsage: null, cpuFreq: null, memory: null },
        1000,
        async () => ({
            cpuTemp: await getCpuTemp(),
            cpuUsage: await getCpuUsage(),
            cpuFreq: await getCpuFreq(),
            memory: await getMemory(),
        })
    )


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
                
                <label class="time" label={CurrentTime.as(t => `${t}`)}/>
            </box>

            <box class="right">
                <label class="date" label={CurrentDate.as(d => `󰸗 ${d.date_short} ${d.weekday}`)}/>

                <WifiButton />
                <BluetoothButton/>
                <UpdateButton/>
            </box>

        </box>
    )
}