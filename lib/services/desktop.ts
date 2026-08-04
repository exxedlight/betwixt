import GLib from "gi://GLib"
import { DesktopConfig, DesktopItem } from "../core/types"
import { createState } from "ags"
import { monitorFile } from "ags/file"

export const DESKTOP_CONFIG_PATH = `${SRC}/configs/desktop.json`
export const [desktopConfig, setDesktopConfig] = createState<DesktopConfig | null>(LoadDesktopConfig())
let reloadTimeoutId: number | null = null

export function SaveDesktopConfig(){
    const cfg = desktopConfig()
 
    if (!cfg) {
        console.error("[desktop] cannot save: no config loaded")
        return false
    }
 
    try {
        const text = JSON.stringify(cfg, null, 2)
        GLib.file_set_contents(DESKTOP_CONFIG_PATH, text)
        return true
    } catch (e) {
        console.error("[desktop] failed to save config:", e)
        return false
    }
}
export function LoadDesktopConfig() : DesktopConfig | null {
    try {
        const [ok, bytes] = GLib.file_get_contents(DESKTOP_CONFIG_PATH)
        if (!ok) return null
        const text = new TextDecoder().decode(bytes)
        return JSON.parse(text) as DesktopConfig
    } catch (e) {
        console.error("Desktop config error:", e)
        return null
    }
}

monitorFile(DESKTOP_CONFIG_PATH, () => {
    if (reloadTimeoutId) GLib.source_remove(reloadTimeoutId)

    reloadTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 150, () => {
        reloadTimeoutId = null
        console.log("[desktop] config changed, reloading")
        setDesktopConfig(LoadDesktopConfig())
        return GLib.SOURCE_REMOVE
    })
})



//  ======      METHODS     ===================================

// Adds an icon. If something already occupies that grid cell, it's replaced
// (this is "set the icon at this position", not "append blindly and risk two
// icons silently fighting over the same cell").
export function AddDesktopIcon(item: DesktopItem): boolean {
    const cfg = desktopConfig()
    if (!cfg) {
        console.error("[desktop] cannot add icon: no config loaded")
        return false
    }
 
    const existingIndex = cfg.items.findIndex(
        i => i.pos[0] === item.pos[0] && i.pos[1] === item.pos[1]
    )
 
    const items = existingIndex >= 0
        ? cfg.items.map((i, idx) => (idx === existingIndex ? item : i))
        : [...cfg.items, item]
 
    setDesktopConfig({ ...cfg, items })
    return SaveDesktopConfig()
}

// Removes whatever icon sits at (col, row), if any.
export function RemoveDesktopIconAt(col: number, row: number): boolean {
    const cfg = desktopConfig()
    if (!cfg) {
        console.error("[desktop] cannot remove icon: no config loaded")
        return false
    }
 
    const items = cfg.items.filter(i => !(i.pos[0] === col && i.pos[1] === row))
 
    if (items.length === cfg.items.length) {
        console.warn(`[desktop] no icon found at (${col}, ${row}), nothing removed`)
        return false
    }
 
    setDesktopConfig({ ...cfg, items })
    return SaveDesktopConfig()
}