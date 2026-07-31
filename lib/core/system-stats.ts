import { exec } from "ags/process"
import GLib from "gi://GLib"


//  Previous tick CPU shot
let prevCPUStat: { idle: number; total: number } | null = null




//  GPU state (nvidia-smi)
export function getGpuAvailable(): boolean {
  try {
    exec(["nvidia-smi", "-L"])
    return true
  } catch {
    return false
  }
}


//  GPU temperature (nvidia-smi)
export function getGpuTemp(): number | null {
  try {
    const out = exec(["nvidia-smi", "--query-gpu=temperature.gpu", "--format=csv,noheader"])
    return parseInt(out.trim(), 10)
  } catch {
    return null
  }
}


//  CPU temperature (hmon address)
export function getCpuTemp(path = "/sys/class/hwmon/hwmon4/temp1_input"): number | null {
  const [ok, bytes] = GLib.file_get_contents(path)
  if (!ok) return null
  const raw = new TextDecoder().decode(bytes).trim()
  return Math.round(parseInt(raw, 10) / 1000)
}


//  CPU frequency
export function getCpuFreq(): number | null {
  try {
    const out = exec([
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
export function getCpuUsage(): number | null {
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
export function getMemory(format: number = 1024): { used: number; total: number } | null {
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