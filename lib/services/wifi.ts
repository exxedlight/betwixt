import { execAsync } from "ags/process"

export type WifiNetwork = {
  bssid: string
  ssid: string
  mode: string
  chan: string
  rate: string
  signal: number
  security: string
  active: boolean
}

export type WifiStatus = {
    enabled: boolean
    connected: boolean
    strength: number
}

function splitNmcli(line: string): string[] {
  return line.split(/(?<!\\):/).map((s) => s.replace(/\\:/g, ":"))
}


export async function getWifiStatus(): Promise<WifiStatus> {
    const radio = (await execAsync(["nmcli", "radio", "wifi"])).trim()
    const enabled = radio === "enabled"
    if (!enabled) return { enabled: false, connected: false, strength: 0 }

    const out = await execAsync(["nmcli", "-t", "-f", "ACTIVE,SIGNAL", "device", "wifi"])
    const activeLine = out.split("\n").find((l) => l.startsWith("yes:"))
    if (!activeLine) return { enabled: true, connected: false, strength: 0 }

    const [, signal] = activeLine.split(":")
    return { enabled: true, connected: true, strength: parseInt(signal, 10) || 0 }
}

export async function scanWifi() {
    await execAsync(["nmcli", "device", "wifi", "rescan"]).catch(() => { })
}

export async function getWifiNetworks(): Promise<WifiNetwork[]> {
  //await scanWifi()
  const out = await execAsync([
    "nmcli", "-t", "-f",
    "IN-USE,BSSID,SSID,MODE,CHAN,RATE,SIGNAL,SECURITY",
    "device", "wifi", "list",
  ])

  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [inUse, bssid, ssid, mode, chan, rate, signal, security] = splitNmcli(line)
      return {
        bssid,
        ssid: ssid || "(hidden)",
        mode,
        chan,
        rate,
        signal: parseInt(signal, 10) || 0,
        security: security || "--",
        active: inUse === "*",
      }
    })
}

export class SecretsRequiredError extends Error {
  constructor(public bssid: string) {
    super("secrets required")
  }
}

export async function connectWifi(bssid: string, password?: string) {
  try {
    const cmd = password
      ? ["nmcli", "device", "wifi", "connect", bssid, "password", password]
      : ["nmcli", "device", "wifi", "connect", bssid]

    await execAsync(cmd)
  } catch (e) {
    const msg = String(e)

    if (!password && /secrets were required|802-11-wireless-security/i.test(msg)) {
      throw new SecretsRequiredError(bssid)
    }

    const text = password
      ? "Wrong password or connection error"
      : "Connection error"

    execAsync(["notify-send", "Wi-Fi", text, "-i", "package-purge"])
    throw e
  }
}

export function setWifiRadio(enabled: boolean) {
    execAsync(["nmcli", "radio", "wifi", enabled ? "on" : "off"])
    if (!enabled) {
        execAsync([
            "notify-send", "Wi-Fi Disabled", "-i", "network-wireless-off",
        ])
    }
}