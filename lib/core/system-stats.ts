import { exec, execAsync } from "ags/process"
import Gio from "gi://Gio";
import GLib from "gi://GLib"

//  Previous tick CPU shot
let prevCPUStat: { idle: number; total: number } | null = null

//  Regular names for CPU temp
const CPU_TEMP_DRIVERS = ["coretemp", "k10temp", "zenpower"]
let cpuTempPath: string | null | undefined



//  GPU state (nvidia-smi)
export async function getGpuAvailable(): Promise<boolean> {
  try {
    await execAsync(["nvidia-smi", "-L"])
    return true
  } catch {
    return false
  }
}


//  GPU temperature (nvidia-smi)
export async function getGpuTemp(): Promise<number | null> {
  try {
    const out = await execAsync(["nvidia-smi", "--query-gpu=temperature.gpu", "--format=csv,noheader"])
    return parseInt(out.trim(), 10)
  } catch {
    return null
  }
}



//  ===   CPU temperature   ===


function resolveCpuTempPath(): string | null {
  const base = "/sys/class/hwmon"
  const list = Gio.File.new_for_path(base).enumerate_children(
    "standard::name", Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null,
  )
  let info: Gio.FileInfo | null
  while ((info = list.next_file(null))) {
    const [ok, bytes] = GLib.file_get_contents(`${base}/${info.get_name()}/name`)
    if (!ok) continue
    if (CPU_TEMP_DRIVERS.includes(new TextDecoder().decode(bytes).trim()))
      return `${base}/${info.get_name()}/temp1_input`
  }
  return null
}

export async function getCpuTemp(): Promise<number | null> {
  if (cpuTempPath === undefined) cpuTempPath = resolveCpuTempPath()
  if (!cpuTempPath) return null
  const [ok, bytes] = GLib.file_get_contents(cpuTempPath)
  if (!ok) return null
  return Math.round(parseInt(new TextDecoder().decode(bytes).trim(), 10) / 1000)
}


//  CPU frequency
export async function getCpuFreq(): Promise<number | null> {
  try {
    const out = await execAsync([
      "bash", "-c",
      "cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq 2>/dev/null | sort -nr | head -1",
    ])
    const khz = parseInt(out.trim(), 10)
    return Math.round(khz / 1000)
  } catch {
    return null
  }
}


//  CPU usage by two /proc/stat
export async function getCpuUsage(): Promise<number | null> {
  const [ok, bytes] = GLib.file_get_contents("/proc/stat")
  if (!ok) return null

  const line = new TextDecoder().decode(bytes).split("\n")[0]
  const parts = line.trim().split(/\s+/).slice(1).map(Number)
  const idle = parts[3] + parts[4] // idle + iowait
  const total = parts.reduce((a, b) => a + b, 0)

  if (!prevCPUStat) {
    prevCPUStat = { idle, total }
    return null
  }

  const idleDelta = idle - prevCPUStat.idle
  const totalDelta = total - prevCPUStat.total
  prevCPUStat = { idle, total }

  if (totalDelta <= 0) return null
  return Math.round((1 - idleDelta / totalDelta) * 100)
}


//  RAM usage (default format is 1024, may be changed to 1000, iyw)
export async function getMemory(format: number = 1024): Promise<{ used: number; total: number } | null> {
  const [ok, bytes] = GLib.file_get_contents("/proc/meminfo")
  if (!ok) return null

  const text = new TextDecoder().decode(bytes)
  const get = (key: string) => {
    const match = text.match(new RegExp(`${key}:\\s+(\\d+)`))
    return match ? parseInt(match[1], 10) : 0
  }

  const totalKb = get("MemTotal")
  const availableKb = get("MemAvailable")

  return {
    used: (totalKb - availableKb) / format / format,
    total: totalKb / format / format,
  }
}