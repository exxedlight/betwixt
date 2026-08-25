import { execAsync, subprocess } from "ags/process";
import GLib from "gi://GLib";
import { createState } from "gnim"
import { onClick } from "../../../lib/core/gestures";
import { launchCommand } from "../../../lib/services/hyprland-exec";


type UpdateState = { icon: string; tooltip: string }
type CheckResult = { ok: boolean; pac: number; aur: number; helper: string }

const aurHelpers = [
    "paru", "yay", "aura", "pikaur", "trizen"
]


const checkUpdates = async (): Promise<CheckResult> => {
    const countLines = (text: string): number =>
        text.split("\n").filter(line => line.trim().length > 0).length

    //  -- Detect first available AUR helper
    const helper = aurHelpers.find(h => GLib.find_program_in_path(h)) ?? ""

    //  -- Official updates via checkupdates
    let pac = 0
    try {
        const out = await execAsync(["checkupdates"])
        pac = countLines(out)
    } catch (e: any) { /* ignore errors, continue with pac=0 */ }

    let aur = 0
    if (helper) {
        try {
            const out = await execAsync([helper, "-Quaq"])
            aur = countLines(out)
        } catch { /* helper failed - non-critical, continue with aur=0 */ }
    }
    return { ok: true, pac, aur, helper }
}


export default function UpdateButton(){

    const [updateState, setUpdateState] = createState<UpdateState>({ icon: "󰸟", tooltip: "Checking updates..." })

    async function refresh() {
        const res = await checkUpdates()

        if (!res.ok)
            return setUpdateState({ icon: "󰒑", tooltip: "Cannot fetch updates. Right-click to retry." })
        if (res.pac + res.aur === 0)
            return setUpdateState({ icon: "󰸟", tooltip: "No updates available" })

        const tooltip = `<b>Official</b>: ${res.pac}` + (res.helper ? `\n<b>AUR(${res.helper})</b>: ${res.aur}` : "")
        setUpdateState({ icon: res.pac == 0 ? "󰸟" : "󰄠", tooltip })
    }

    GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3600, () => {
        refresh()
        return GLib.SOURCE_CONTINUE
    })

    refresh()

    return (
        <label
            cssClasses={["nexus-button", "update-button"]} 
            label={updateState.as(s => s.icon)}
            tooltipMarkup={updateState.as(t => t.tooltip)}
            xalign={0.5}
            $={(self) => {
                onClick({
                    primary:    () => launchCommand("kitty -e sudo pacman -Syu"),
                    secondary:  () => refresh()
                })(self)
            }}
        />
    )
}