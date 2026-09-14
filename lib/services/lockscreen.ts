import GLib from "gi://GLib"
import { setLockscreenVisible } from "../global-states"
import { execAsync } from "ags/process"
import { createState } from "ags"

export const [lockscreenImagePath, setLockscreenImagePath] = createState<string | null>(null)


export async function Lock() {
    const path = `${SRC}/tmp/lockscreen-shot-${Date.now()}.png`

    execAsync(`mkdir -p ${SRC}/tmp`)

    try {
        await execAsync(["grim", path])
        setLockscreenImagePath(path)
    } catch (err) { console.error("[lockscreen] screenshot failed:", err) }

    setLockscreenVisible(true)
}

export async function Unlock() {
    setLockscreenVisible(false)
    cleanupLockscreenShots()
}



export function cleanupLockscreenShots() {
    const dirPath = `${SRC}/tmp`

    try {
        const dir = GLib.Dir.open(dirPath, 0)
        let name: string | null
        while ((name = dir.read_name()) !== null) {
            if (name.startsWith("lockscreen-shot") && name.endsWith(".png")) {
                try {
                    GLib.unlink(`${dirPath}/${name}`)
                } catch (err) { console.error(`[lockscreen] failed to remove ${name}:`, err) }
            }
        }
    } catch (err) { console.error("[lockscreen] cleanup failed:", err) }
}