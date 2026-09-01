import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4"
import { getCpuFreq, getCpuTemp, getCpuUsage, getGpuAvailable, getGpuTemp, getMemory } from "../../lib/core/system-stats"
import { NexusPanelKey, toggleNexusPanel } from "../../lib/global-states"
import { onClick } from "../../lib/core/gestures"
import { CurrentDate, CurrentTime } from "../../lib/services/date-time"


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

            <label label="󰻇" 
                cssClasses={gpuAvailable.as((a) => 
                    a ? ["stats-label", "gpu-icon", "available"] : ["stats-label", "gpu-icon", "unavailable"]
                )}
                halign={Gtk.Align.CENTER}
                xalign={0}
            />
            
            <box class="temps" spacing={6}>
                <label 
                    label={gpuTemp.as((t) => (t !== null ? `󱃃 ${t}°C` : "󱃃 --°C"))} 
                    cssClasses={["stats-label", "temp-gpu"]} 
                />
                <label 
                    label={stats.as((s) => (s.cpuTemp !== null ? `󱃃 ${s.cpuTemp}°C` : "󱃃 --°C"))} 
                    cssClasses={["stats-label", "temp-cpu"]}
                />
            </box>

            
            <box class="cpu">
                <label label={stats.as((s) => `󰍛 ${s.cpuUsage ?? "---"}%`)} 
                    xalign={0}
                    class="load"
                    widthRequest={60} 
                />
                <label label={stats.as((s) => (s.cpuFreq !== null ? `${s.cpuFreq}` : "--"))} 
                    class="small"
                    valign={Gtk.Align.END}
                />
            </box>


            <label
                label="󰣇"
                class="menu-button"
                halign={Gtk.Align.CENTER}
                $={onClick(() => toggleNexusPanel(NexusPanelKey.APPS))} 
            />

            
            <box class="ram">
                <label label={stats.as((s) => s.memory ? `󰘚 ${s.memory.used.toFixed(1)} GB` : "--" )}
                    xalign={0}
                    class="load"
                />
                <label label={stats.as((s) => s.memory ? `${s.memory.total.toFixed(1)}` : "--")} class="small" valign={Gtk.Align.END} />
            </box>

            <label class="time" label={CurrentTime.as(t => `${t}`)}/>
            <label class="date" label={CurrentDate.as(d => `󰸗 ${d.date_short} ${d.weekday}`)}/>

        </box>
    )
}