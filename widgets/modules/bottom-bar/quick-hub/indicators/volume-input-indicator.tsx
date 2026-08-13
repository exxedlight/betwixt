import { createState, createComputed } from "ags"
import { onClick, onHover, onScroll } from "../../../../../lib/core/gestures"
import { execAsync } from "ags/process"
import { onPulseEvent } from "../../../../../lib/services/pulse-subscribe";

type Props = {
    onEnter?: () => void;
    onLeave?: () => void;
}

export default function VolumeInputIndicator({ onEnter, onLeave }: Props) {
    const [percent, setPercent] = createState(50)
    const [muted, setMuted] = createState(false)

    const micVar = createComputed(() => {
        const icon = muted() ? "󰍭" : "󰍬"
        return `${icon} ${percent()}%`.padEnd(6, " ")
    })

    // Get token (ignore old changes)
    let generation = 0

    const syncFromSystem = async () => {
        const gen = ++generation
        try {
            const output = await execAsync("wpctl get-volume @DEFAULT_AUDIO_SOURCE@")
            if (gen !== generation) return

            setMuted(output.includes("[MUTED]"))
            setPercent(Math.round(parseFloat(output.split(" ")[1]) * 100))
        } catch (err) {
            console.error("Mic reading error:", err)
        }
    }

    const changeVolume = (delta: number) => {
        setPercent((prev) => Math.max(0, Math.min(100, prev + delta)))

        const arg = delta > 0 ? "1%+" : "1%-"
        execAsync(`wpctl set-volume -l 1.0 @DEFAULT_AUDIO_SOURCE@ ${arg}`).catch((err) =>
            console.error("Mic volume change error:", err)
        )
    }

    const toggleMute = () => {
        setMuted((m) => !m)
        execAsync("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle").catch((err) =>
            console.error("Mic mute toggle error:", err)
        )
    }

    onPulseEvent("source", syncFromSystem)

    syncFromSystem()

    return (
        <label 
            label={micVar}
            class="volume-input-indicator"
            xalign={0.5}
            $={(self) => {
                onScroll({
                    up: () => changeVolume(1),
                    down: () => changeVolume(-1)
                })(self)

                onClick({
                    primary: () => toggleMute()
                })(self)

                onHover({
                    enter: () => onEnter?.(),
                    leave: () => onLeave?.(),
                })(self)
            }}
        />
    )
}