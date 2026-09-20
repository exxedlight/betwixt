import { createState } from "ags"
import { execAsync } from "ags/process"
import Gio from "gi://Gio"
import GLib from "gi://GLib"
import { Gdk } from "ags/gtk4"

const RUNTIME_DIR = GLib.getenv("XDG_RUNTIME_DIR")
const HYPR_SIG = GLib.getenv("HYPRLAND_INSTANCE_SIGNATURE")
const SOCKET2_PATH = `${RUNTIME_DIR}/hypr/${HYPR_SIG}/.socket2.sock`

const RELEVANT_EVENTS = ["workspace>>", "openwindow>>", "closewindow>>"]

const THUMB_SCALE = 0.2
const DEBOUNCE_MS = 100

export const [wsTextures, setWsTextures] = createState<Record<number, Gdk.Texture>>({})

let debounceTimer: number | null = null

//  grim writes to stdout ("-"), raw bites
function captureBytes(argv: string[]): Promise<GLib.Bytes> {
    return new Promise((resolve, reject) => {
        try {
            const proc = Gio.Subprocess.new(argv, Gio.SubprocessFlags.STDOUT_PIPE)
            proc.communicate_async(null, null, (_proc, res) => {
                try {
                    const [, stdout] = proc.communicate_finish(res)
                    if(stdout)
                        resolve(stdout)
                } catch (err) {
                    reject(err)
                }
            })
        } catch (err) {
            reject(err)
        }
    })
}

async function resolveOutputName(wsId: number): Promise<string | null> {
    try {
        const monitors = JSON.parse(await execAsync(["hyprctl", "monitors", "-j"])) as
            { name: string; activeWorkspace: { id: number } }[]
        return monitors.find(m => m.activeWorkspace.id === wsId)?.name ?? null
    } catch (err) {
        console.error("[ws-overview] failed to resolve output:", err)
        return null
    }
}

async function snapshotWorkspace(wsId: number) {
    const outputName = await resolveOutputName(wsId)
    if (!outputName) return   // not active monitor

    try {
        const bytes = await captureBytes(["grim", "-o", outputName, "-s", String(THUMB_SCALE), "-"])
        const texture = Gdk.Texture.new_from_bytes(bytes)
        setWsTextures(prev => ({ ...prev, [wsId]: texture }))
    } catch (err) {
        console.error(`[ws-overview] snapshot failed for ws ${wsId}:`, err)
    }
}

async function snapshotActiveWorkspace() {
    try {
        const active = JSON.parse(await execAsync(["hyprctl", "activeworkspace", "-j"])) as { id: number }
        await snapshotWorkspace(active.id)
    } catch (err) {
        console.error("[ws-overview] failed to resolve active workspace:", err)
    }
}

function scheduleSnapshot() {
    if (debounceTimer) GLib.source_remove(debounceTimer)
    debounceTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, DEBOUNCE_MS, () => {
        debounceTimer = null
        snapshotActiveWorkspace()
        return GLib.SOURCE_REMOVE
    })
}

export function startWorkspaceWatcher() {
    const address = Gio.UnixSocketAddress.new(SOCKET2_PATH)
    const client = new Gio.SocketClient()

    client.connect_async(address, null, (_client, res) => {
        try {
            const conn = client.connect_finish(res)
            const stream = new Gio.DataInputStream({ base_stream: conn.get_input_stream() })

            const readLoop = () => {
                stream.read_line_async(GLib.PRIORITY_DEFAULT, null, (_s, res2) => {
                    try {
                        const [line] = stream.read_line_finish_utf8(res2)
                        if (line === null) return

                        if (RELEVANT_EVENTS.some(prefix => line.startsWith(prefix))) {
                            scheduleSnapshot()
                        }
                        readLoop()
                    } catch (err) {
                        console.error("[ws-overview] socket read failed:", err)
                    }
                })
            }
            readLoop()
        } catch (err) {
            console.error("[ws-overview] failed to connect to socket2:", err)
        }
    })
}