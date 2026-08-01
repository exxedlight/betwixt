import Battery from "gi://AstalBattery"
import GLib from "gi://GLib"
import { createBinding, createComputed } from "ags"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { setPowerPlan } from "./powerplans"
import config from "../../configs/battery.json"
import { isHypridleRunningAsync, runIdleDaemon, stopIdleDaemon } from "./idle"


//  Config JSON structure
type BatteryConfig = {
    levels: { warning: number; critical: number }
    actions: Record<string, string>
}

const cfg = config as BatteryConfig
const device = Battery.get_default()

// percentage in AstalBattery - froat 0..1, so *100
export const batteryPercent = createBinding(device, "percentage").as((p) => Math.round(p * 100))
export const batteryCharging = createBinding(device, "charging")


export const batteryStateClass = createComputed(() => {
    const percent = batteryPercent()
    const charging = batteryCharging()

    if (charging && percent !== 100) return "charging"
    if (percent <= cfg.levels.critical) return "critical"
    if (percent <= cfg.levels.warning) return "warning"
    return ""
})

// --- AC power: reading from sysfs
// Its NOT same with device.charging, on full battery with plug in
// charging is false, but AC still online
const AC_ONLINE_PATH = "/sys/class/power_supply/ACAD/online"

function isAcOnline(): boolean {
    try {
        const [, bytes] = GLib.file_get_contents(AC_ONLINE_PATH)
        return new TextDecoder().decode(bytes).trim() === "1"
    } catch {
        return true // no file ==> (Desktop, no battery) ==> AC always online
    }
}
const acOnline = createPoll<boolean>(isAcOnline(), 1000, () => isAcOnline())



// --- AC plug on/off triggers  -------------------------------------------------------

async function onChargingStart() {
    // AC connected ==> set powerplan 'balanced'
    await setPowerPlan("balanced")

    execAsync([
        "notify-send",
        "--app-name", "silent-notify",
        "AC ON",
        "󰚥 󰂅 \tPower supply connected",
    ])

    //  disable hypridle
    await stopIdleDaemon();
}

async function onChargingStop() {
    // AC disconnected ==> set powerplan 'ultra-eco'
    await setPowerPlan("ultra-eco")

    execAsync([
        "notify-send",
        "--app-name", "silent-notify",
        "AC OFF",
        "󰚦 󰁹 \tNo power supply, using battery",
    ])
    
    await runIdleDaemon();
}

let wasAcOnline = acOnline()

acOnline.subscribe(() => {
    const online = acOnline()
    if (online === wasAcOnline) return
    wasAcOnline = online

    if (online) onChargingStart()
    else onChargingStop()
})
//  ---------------------------------------------------------------------------------





//  --- Threshold actions (battery.json) --------------------------------------------

// One time by descharging cycle
const thresholds = Object.keys(cfg.actions)
    .map(Number)
    .sort((a, b) => b - a) // from higher treshold to lower

const firedThresholds = new Set<number>()
let wasCharging = device.charging

batteryCharging.subscribe(() => {
    const charging = batteryCharging()

    //  Clear threashold when AC plugged in
    if (charging && !wasCharging)
        firedThresholds.clear()

    wasCharging = charging
})

batteryPercent.subscribe(() => {
    const percent = batteryPercent()
    if (batteryCharging()) return // only while discharging

    for (const threshold of thresholds) {
        if (percent <= threshold && !firedThresholds.has(threshold)) {
            firedThresholds.add(threshold)
            execAsync(cfg.actions[String(threshold)]).catch((err) =>
                console.error(`[battery] action for ${threshold}% failed:`, err)
            )
        }
    }
})
//  ----------------------------------------------------------------------------------