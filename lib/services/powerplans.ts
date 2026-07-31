import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"

import config from "../../configs/powerplans.json"
const plans = config as Record<PowerPlanId, PowerPlanDef>

type PowerPlanId = keyof typeof config
type PowerPlanDef = { plan: string; freq: number } // frequency in MHz, as in json

//  --- Helpers -------------------------------------------------------
const toKhz = (mhz: number) => mhz * 1000

function formatTitle(id: string): string {
    return id
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ")
}
//  -------------------------------------------------------------------



export async function setPowerPlan(id: PowerPlanId) {
    const def = plans[id]
    if (!def) {
        console.error(`[powerplans] unknown plan: "${id}"`)
        return
    }

    try {
        await execAsync(["powerprofilesctl", "set", def.plan])
        await execAsync(["sudo", "cpupower", "frequency-set", "-u", `${toKhz(def.freq)}`])

        const ghz = (def.freq / 1000).toFixed(1)
        await execAsync([
            "notify-send",
            "Power",
            `Power plan: ${formatTitle(id)}\nCPU limit: ${ghz} GHz`,
        ])
    } catch (err) {
        console.error(`[powerplans] failed to apply "${id}":`, err)
    }
}

// --- Определение текущего активного плана (для подсветки кнопок)

function readCurrentMaxFreqKhz(): number | null {
    try {
        const [, bytes] = GLib.file_get_contents("/sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq")
        return parseInt(new TextDecoder().decode(bytes).trim(), 10)
    } catch {
        return null
    }
}

async function readCurrentProfile(): Promise<string | null> {
    try {
        return (await execAsync(["powerprofilesctl", "get"])).trim()
    } catch {
        return null
    }
}

// null, если текущее состояние системы не совпадает ни с одним планом из конфига
// (например, частоту поменяли вручную мимо шелла)
export const activePowerPlan = createPoll<PowerPlanId | null>(null, 2000, async () => {
    const profile = await readCurrentProfile()
    const freq = readCurrentMaxFreqKhz()

    if (!profile || freq === null) return null

    for (const id of Object.keys(plans) as PowerPlanId[]) {
        const def = plans[id]
        if (def.plan === profile && toKhz(def.freq) === freq) {
            return id
        }
    }

    return null
})

export function applyInitialPowerPlan() {
    setPowerPlan("balanced")
}