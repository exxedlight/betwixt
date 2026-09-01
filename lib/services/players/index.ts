import { execAsync } from "ags/process"
import { PlayerAdapter, PlayerConfig } from "../../core/types"
import { activePlayerConfig } from "../mpris"
import { audaciousAdapter } from "./audacious"
import { launchCommand } from "../hyprland-exec"


const adapters: Record<string, PlayerAdapter> = {
    audacious: audaciousAdapter,
    // vlc: vlcAdapter,
    // mpv: mpvAdapter,
}

export function getPlayerAdapter(name: string | null): PlayerAdapter | null {
    return name ? adapters[name] ?? null : null
}

export async function runPlayerQuery<T>(
    action: keyof PlayerConfig,
    parse: (raw: string) => T,
    fallback: T,
): Promise<T> {
    const cmd = activePlayerConfig()?.[action]
    if (!cmd) return fallback
    try {
        const out = await execAsync(["bash", "-c", cmd])
        return parse(out)
    } catch {
        return fallback
    }
}
export function runPlayerAction(
    action: keyof PlayerConfig,
    vars?: Record<string, string | number>,
) {
    const cfg = activePlayerConfig()
    let cmd = cfg?.[action]
    if (!cmd) return

    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            cmd = cmd.replace(`{${k}}`, String(v))
        }
    }

    launchCommand(cmd)
}