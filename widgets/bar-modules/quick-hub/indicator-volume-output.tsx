import { createState, createComputed } from "ags"
import { execAsync, subprocess } from "ags/process"
import { onPulseEvent } from "../../../lib/services/pulse-subscribe";
import { onClick, onHover, onScroll } from "../../../lib/core/gestures";

type SinkKind = "speaker" | "headphones" | "headset"

const ICONS: Record<SinkKind, { muted: string; low: string; medium: string; high: string }> = {
    speaker:    { muted: "󰝟", low: "󰕿", medium: "󰖀", high: "󰕾" },
    headphones: { muted: "󰟎", low: "󰋋", medium: "󰋋", high: "󰋋" },
    headset:    { muted: "󰋐", low: "󰋎", medium: "󰋎", high: "󰋎" },
}

// Recognise device by active sink port
async function getSinkKind(): Promise<SinkKind> {
    try {
        const defaultSink = (await execAsync(["pactl", "get-default-sink"])).trim()
        const raw = await execAsync(["pactl", "-f", "json", "list", "sinks"])
        const sinks: Array<{ name: string; active_port?: string | null }> = JSON.parse(raw)

        const sink = sinks.find((s) => s.name === defaultSink)
        const port = (sink?.active_port ?? "").toLowerCase()

        if (port.includes("headset")) return "headset"
        if (port.includes("headphone")) return "headphones"
        return "speaker"
    } catch {
        return "speaker"
    }
}

type Props = {
    onEnter?: () => void;
    onLeave?: () => void;
}

export default function VolumeOutputIndicator( {onEnter, onLeave} : Props ) {
    const [percent, setPercent] = createState(50)
    const [muted, setMuted] = createState(false)
    const [sinkKind, setSinkKind] = createState<SinkKind>("speaker")

    const volumeVar = createComputed(() => {
        const icons = ICONS[sinkKind()]
        const p = percent()

        let icon = icons.high
        if (muted()) icon = icons.muted
        else if (p < 33) icon = icons.low
        else if (p < 66) icon = icons.medium

        return `${icon} ${p}%`.padEnd(7, " ")
    })

    // Gen token (ignore old changes)
    let generation = 0

    const syncFromSystem = async () => {
        const gen = ++generation
        try {
            const [volOut, kind] = await Promise.all([
                execAsync("wpctl get-volume @DEFAULT_AUDIO_SINK@"),
                getSinkKind(),
            ])

            if (gen !== generation) return

            const isMuted = volOut.includes("[MUTED]")
            const volumeFloat = parseFloat(volOut.split(" ")[1])

            setMuted(isMuted)
            setPercent(Math.round(volumeFloat * 100))
            setSinkKind(kind)
        } catch (err) {
            console.error("Volume reading error:", err)
        }
    }

    let syncTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleSync = (delay = 120) => {
        if (syncTimer) clearTimeout(syncTimer)
        syncTimer = setTimeout(syncFromSystem, delay)
    }

    const changeVolume = (delta: number) => {
        setPercent((prev) => Math.max(0, Math.min(100, prev + delta)))

        const arg = delta > 0 ? "1%+" : "1%-"
        execAsync(`wpctl set-volume -l 1.0 @DEFAULT_AUDIO_SINK@ ${arg}`).catch((err) =>
            console.error("Volume change error:", err)
        )

        scheduleSync()
    }

    const toggleMute = () => {
        setMuted((m) => !m) 
        execAsync("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle").catch((err) =>
            console.error("Mute toggle error:", err)
        )
        scheduleSync()
    }

    onPulseEvent("sink", () => scheduleSync(30))

    syncFromSystem()

    return (
        <label
            label={volumeVar}
            class="volume-output-indicator"
            xalign={0.5}
            $={(self) => {
                onScroll({
                    up: () => changeVolume(1),
                    down: () => changeVolume(-1),
                })(self)

                onClick({
                    primary: () => toggleMute(),
                    secondary: () => execAsync("pavucontrol"),
                })(self)

                onHover({
                    enter: () => onEnter?.(),
                    leave: () => onLeave?.(),
                })(self)
            }}
        />
    )
}