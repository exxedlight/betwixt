import Gio from "gi://Gio"
import GLib from "gi://GLib"
import { createComputed, createState } from "ags"
import { createPoll } from "ags/time"


//  Only God and I know what is written here. 
//  I have forgotten; now only God knows.



//  But if seriosly, Astal mpris was broken:
//  - bug when killing player and start it again,
//      Mpris falls in vala error:
//      player.vala:840: GDBus.Error:org.freedesktop.DBus.Error.UnknownMethod: Object does not exist at path “/org/mpris/MediaPlayer2”


//  So here is a manual implementation of DBus manipulation via Gio
//  Don't ask how it works, I'd fuck its mouth.



//  supported players list; listen ONLY this players
//  write PROCESS NAMES here (3rd column), not busnames:
//  >> busctl --user list | grep org.mpris.MediaPlayer2
//  example configs/player.json: ["audacious", "vivaldi-bin", "TelegramDesktop"]
const CONFIG_PATH = `${SRC}/configs/players.json`

//  MPRIS interfaces
const PLAYER_IFACE = "org.mpris.MediaPlayer2.Player"
const PROPS_IFACE = "org.freedesktop.DBus.Properties"
const OBJ_PATH = "/org/mpris/MediaPlayer2"

//  Reading config file — just a flat list of allowed process names
function getSupportedPlayers(): string[] {
    try {
        const [ok, bytes] = GLib.file_get_contents(CONFIG_PATH)
        if (!ok) return []
        const parsed = JSON.parse(new TextDecoder().decode(bytes))
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
    } catch {
        return []
    }
}

const supportedNames = getSupportedPlayers()
const toBusName = (n: string) => n.startsWith("org.mpris.") ? n : `org.mpris.MediaPlayer2.${n}`

// ---- process-name resolution (busname -> real process name via /proc) ----
const procNameCache = new Map<string, string | null>()

function getProcessName(busName: string): string | null {
    if (procNameCache.has(busName)) return procNameCache.get(busName)!
    let name: string | null = null
    try {
        const [pid] = Gio.DBus.session.call_sync(
            "org.freedesktop.DBus", "/org/freedesktop/DBus",
            "org.freedesktop.DBus", "GetConnectionUnixProcessID",
            new GLib.Variant("(s)", [busName]), null,
            Gio.DBusCallFlags.NONE, -1, null,
        ).deep_unpack() as [number]

        const [ok, bytes] = GLib.file_get_contents(`/proc/${pid}/comm`)
        if (ok) name = new TextDecoder().decode(bytes).trim()
    } catch (e) {
        console.warn("[MPRIS] failed to resolve process name for:", busName, e)
    }
    procNameCache.set(busName, name)
    return name
}

// match by PROCESS NAME, not by busname
const matches = (n: string) => {
    if (supportedNames.length === 0) return true
    const proc = getProcessName(n)
    return proc ? supportedNames.some(s => proc.includes(s)) : false
}

// Re-evaluation trigger for activePlayer. Fires ONLY on real D-Bus events.
const [tick, setTick] = createState(0)
const bump = () => setTick(t => t + 1)


// MPRIS interface wrapper on Gio
class MprisPlayer {
    private player: Gio.DBusProxy
    private props: Gio.DBusProxy
    private lastPos = 0
    readonly bus: string
    readonly processName: string

    constructor(bus: string) {
        this.bus = bus
        this.processName = getProcessName(bus) ?? bus
        const flags = Gio.DBusProxyFlags.DO_NOT_AUTO_START
        this.player = Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SESSION, flags, null, bus, OBJ_PATH, PLAYER_IFACE, null,
        )
        this.props = Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SESSION, flags, null, bus, OBJ_PATH, PROPS_IFACE, null,
        )
        // PlaybackStatus / Volume / Metadata change => re-pick active player
        this.player.connect("g-properties-changed", () => bump())
    }

    // alive = bus name currently owned (Gio tracks this itself, no race)
    get alive(): boolean {
        try { return !!this.player.get_name_owner() } catch { return false }
    }

    private pcall(method: string, args: GLib.Variant | null): GLib.Variant | null {
        try { return this.player.call_sync(method, args, Gio.DBusCallFlags.NONE, 500, null) }
        catch { return null }
    }
    private scall(method: string, args: GLib.Variant): GLib.Variant | null {
        try { return this.props.call_sync(method, args, Gio.DBusCallFlags.NONE, 500, null) }
        catch { return null }
    }

    private meta(): Record<string, any> {
        const v = this.player.get_cached_property("Metadata")
        if (!v) return {}
        try { return v.recursiveUnpack() || {} } catch { return {} }
    }

    get title(): string { return this.meta()["xesam:title"] || "" }

    get artist(): string {
        const a = this.meta()["xesam:artist"]
        if (!a) return ""
        return Array.isArray(a) ? a.join(", ") : String(a)
    }

    get playback_status(): string {
        const v = this.player.get_cached_property("PlaybackStatus")
        return v ? v.unpack() as string : "Stopped"
    }

    get volume(): number {
        const v = this.player.get_cached_property("Volume")
        return v ? v.unpack() as number : 0
    }
    set volume(val: number) {
        this.scall("Set", new GLib.Variant("(ssv)", [
            PLAYER_IFACE, "Volume", new GLib.Variant("d", val),
        ]))
    }

    // seconds (spec gives microseconds)
    get length(): number {
        const us = this.meta()["mpris:length"]
        return typeof us === "number" ? us / 1_000_000 : 0
    }

    // seconds; read fresh via Properties.Get (Position is not in PropertiesChanged)
    get position(): number {
        const r = this.scall("Get", new GLib.Variant("(ss)", [PLAYER_IFACE, "Position"]))
        if (!r) return this.lastPos
        try { this.lastPos = (r.recursiveUnpack() as number) / 1_000_000 } catch {}
        return this.lastPos
    }
    set position(sec: number) {
        const id = this.meta()["mpris:trackid"] || "/"
        this.lastPos = sec
        this.pcall("SetPosition", new GLib.Variant("(ox)", [id, Math.round(sec * 1_000_000)]))
    }

    get loop_supported(): boolean {
        return this.player.get_cached_property("LoopStatus") !== null
    }
    get loop_status(): string {
        const v = this.player.get_cached_property("LoopStatus")
        return v ? v.unpack() as string : "None"
    }
    set loop_status(status: string) {
        this.scall("Set", new GLib.Variant("(ssv)", [
            PLAYER_IFACE, "LoopStatus", new GLib.Variant("s", status),
        ]))
    }

    get shuffle_supported(): boolean {
        return this.player.get_cached_property("Shuffle") !== null
    }
    get shuffle(): boolean {
        const v = this.player.get_cached_property("Shuffle")
        return v ? v.unpack() as boolean : false
    }
    set shuffle(val: boolean) {
        this.scall("Set", new GLib.Variant("(ssv)", [
            PLAYER_IFACE, "Shuffle", new GLib.Variant("b", val),
        ]))
    }

    play_pause() { this.pcall("PlayPause", null) }
    next() { this.pcall("Next", null) }
    previous() { this.pcall("Previous", null) }
}



// One wrapper per name, created once, lives forever.
const tracked = new Map<string, MprisPlayer>()
const [knownNames, setKnownNames] = createState<string[]>([])

const ensureName = (name: string) => {
    const bus = toBusName(name)
    if (!tracked.has(bus)) {
        try { tracked.set(bus, new MprisPlayer(bus)) }
        catch (e) { console.warn("[MPRIS] proxy create failed:", bus, e); return }
    }
    setKnownNames(prev => (prev.includes(bus) ? prev : [...prev, bus]))
}

// Watch owner changes for everyone (survives SIGKILL + relaunch)
Gio.DBus.session.signal_subscribe(
    "org.freedesktop.DBus", "org.freedesktop.DBus",
    "NameOwnerChanged", "/org/freedesktop/DBus", null,
    Gio.DBusSignalFlags.NONE,
    (_c, _s, _p, _i, _m, params) => {
        const [name, , owner] = params.deep_unpack() as [string, string, string]
        if (!name.startsWith("org.mpris.MediaPlayer2.")) return
        if (owner === "") {
            // owner disappeared — drop cached process name so a relaunched
            // process (possibly different PID) gets resolved fresh next time
            procNameCache.delete(name)
            console.log(`[MPRIS] owner DOWN: ${name}`) // removable
            bump()
            return
        }
        if (!matches(name)) return
        ensureName(name)
        console.log(`[MPRIS] owner UP: ${name}`) // removable
        bump()
    },
)

// Pick up players already running at shell start
const [existing] = Gio.DBus.session.call_sync(
    "org.freedesktop.DBus", "/org/freedesktop/DBus",
    "org.freedesktop.DBus", "ListNames", null, null,
    Gio.DBusCallFlags.NONE, -1, null,
).deep_unpack() as [string[]]
for (const n of existing)
    if (n.startsWith("org.mpris.MediaPlayer2.") && matches(n)) ensureName(n)


//  Current player
export const activePlayer = createComputed<MprisPlayer | null>(() => {
    tick()
    const ready = knownNames().map(n => tracked.get(n)!).filter(p => p && p.alive)
    if (ready.length === 0) return null
    return ready.find(p => p.playback_status === "Playing") ||
           ready.find(p => p.playback_status === "Paused") ||
           ready[0]
})

// resolved process name of the active player (e.g. "audacious", "vivaldi-bin"),
// intended to be fed into adapters/getPlayerAdapter()
export const activePlayerName = createComputed<string | null>(() => {
    const player = activePlayer()
    if (!player) return null
    return supportedNames.find(s => player.processName.includes(s)) ?? null
})



// ================= GETTERS (unchanged, except isPlaying string compare) =================

export const trackTitle         = createComputed(() => activePlayer()?.title  || "Unknown Track")
export const trackArtist        = createComputed(() => activePlayer()?.artist || "Unknown Artist")
export const isPlaying          = createComputed(() => activePlayer()?.playback_status === "Playing")
export const playerVolume       = createComputed(() => activePlayer()?.volume || 0)
export const trackDuration      = createComputed(() => activePlayer()?.length || 0)
export const loopStatus         = createComputed(() => activePlayer()?.loop_status || "None")
export const shuffleEnabled     = createComputed(() => activePlayer()?.shuffle || false)
export const loopSupported      = createComputed(() => activePlayer()?.loop_supported ?? false)
export const shuffleSupported   = createComputed(() => activePlayer()?.shuffle_supported ?? false)



// ================= PLAYBACK PROGRESS ============================

let suppressUntil = 0
let optimisticPercent = 0
const SEEK_SETTLE_MS = 250

//  Seek to percent (0-100)
export function seekTo(pct: number) {
    const player = activePlayer()
    if (!player || player.length === 0) return

    optimisticPercent = Math.min(100, Math.max(0, Math.round(pct * 100)))
    player.position = pct * player.length

    suppressUntil = GLib.get_monotonic_time() / 1000 + SEEK_SETTLE_MS
}

//  Get current playback progress in percents (0-100)
export const playbackPercentage = createPoll(0, 200, () => {
    const now = GLib.get_monotonic_time() / 1000
    if (now < suppressUntil) return optimisticPercent

    const player = activePlayer()
    if (!player || player.length === 0) return 0

    return Math.min(100, Math.max(0, Math.round((player.position / player.length) * 100)))
})



// ================= SETTERS / ACTIONS ============================

export const cycleLoop = () => {
    const player = activePlayer()
    if (!player) return
    const order = ["None", "Playlist", "Track"] as const
    const next = order[(order.indexOf(player.loop_status as any) + 1) % order.length]
    player.loop_status = next
}

export const toggleShuffle = () => {
    const player = activePlayer()
    if (!player) return
    player.shuffle = !player.shuffle
}

export const setVolume = (val: number) => {
    const player = activePlayer()
    if (!player) return
    player.volume = Math.max(0, Math.min(1, val))
}
export const changeVolume = (delta: number) => {
    const player = activePlayer()
    if (!player) return
    player.volume = Math.max(0, Math.min(1, player.volume + delta))
}

export const togglePlayPause = () => activePlayer()?.play_pause()
export const nextTrack = () => activePlayer()?.next()
export const prevTrack = () => activePlayer()?.previous()