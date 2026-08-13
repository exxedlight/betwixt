import { exec, subprocess } from "ags/process"

type Handler = (line: string) => void
const handlers = new Set<Handler>()

// kill orphans left by previous shell runs before spawning ours
try { exec(["pkill", "-f", "pactl subscribe"]) } catch { /* none running */ }

subprocess(
    ["pactl", "subscribe"],
    (line) => handlers.forEach((h) => h(line)),
    (err) => console.error("[pulse] subscribe error:", err),
)

export function onPulseEvent(filter: "source" | "sink", cb: () => void) {
    handlers.add((line) => {
        if (line.includes("change") && line.includes(filter)) cb()
    })
}