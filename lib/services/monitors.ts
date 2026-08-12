import { Gdk } from "ags/gtk4"

export function getPrimaryMonitorWidth(): number {
    const monitor = Gdk.Display.get_default()?.get_monitors().get_item(0) as Gdk.Monitor | null
    return monitor?.get_geometry().width ?? 1920 // fallback
}