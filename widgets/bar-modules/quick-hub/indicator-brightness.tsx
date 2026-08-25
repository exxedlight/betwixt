import { createState } from "ags"
import { execAsync, subprocess } from "ags/process"
import { onScroll } from "../../../lib/core/gestures"

export default function BrightnessIndicator() {
    const icons = ["", "", "", "", "", "", "", "", ""]
    const [percent, setPercent] = createState(100)

    const label = percent.as((p) => {
        const iconIndex = Math.floor((p / 100) * (icons.length - 1))
        const icon = icons[iconIndex] || icons[0]
        return `${icon} ${p}%`.padEnd(7, " ")
    })

    // Gen token - ignore old tokens
    let generation = 0

    const syncFromSystem = async () => {
        const gen = ++generation
        try {
            const current = await execAsync("brightnessctl i -m")
            if (gen !== generation) return

            const value = parseInt(current.split(",")[3])
            if (!Number.isNaN(value)) setPercent(value)
        } catch (err) {
            console.error("Screen brightness reading error:", err)
        }
    }

    const changeBrightness = (delta: number) => {
        setPercent((prev) => Math.max(0, Math.min(100, prev + delta)))
        const arg = delta > 0 ? "1%+" : "1%-"
        execAsync(`brightnessctl -e4 -n2 set ${arg}`).catch((err) =>
            console.error("Brightness change error:", err)
        )
    }

    // Listening udev-events of backlight subsystem 
    // (sync indicator with all other changes sources)
    subprocess(
        ["udevadm", "monitor", "--udev", "--subsystem-match=backlight"],
        (line) => {
            if (line.includes("change")) syncFromSystem()
        },
        (err) => console.error("Brightness monitor error:", err)
    )

    syncFromSystem()

    return (
        <label 
            label={label}
            class="brightness-indicator"
            xalign={0.5}
            $={(self) => {
                onScroll({
                    up: () => changeBrightness(1),
                    down: () => changeBrightness(-1)
                })(self)
            }}
        />
    )
}