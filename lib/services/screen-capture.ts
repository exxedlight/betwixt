import { exec, execAsync } from "ags/process"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"
import { launchCommand } from "./hyprland-exec"
import config from "../../configs/screen-capture.json"
import Gio from "gi://Gio"

type ScreenCaptureConfig = {
    video: {
        "save-path": string
        "start-command": string   // {file} ==> output mp4
        "stop-command": string
        "start-sound": string
        "stop-sound": string
    }
    img: {
        "save-path": string
        "shutter-sound": string
        "area-to-clipboard-command": string
        "area-markup-command": string
        "fullscreen-to-clipboard-command": string
        "save-to-folder-command": string   // {file} ==> output png
    },
    translate: {
        "source-lang": string
        "target-lang": string
        "tesseract-psm": string
        "tesseract-oem": string
    }
}

const cfg = config as ScreenCaptureConfig


//  === Helpers ==========================================================

function expandHome(path: string): string {
    return path.startsWith("~") ? path.replace("~", GLib.get_home_dir()) : path
}

//  Safe insertion in '...' for shell command
function shQuote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`
}

//  withDash: YYYYMMDD-HHMMSS.mmm   |   !withDash: YYYYMMDDHHMMSS.mmm
function timestamp(withDash: boolean): string {
    const now = new Date()
    const pad = (n: number, len = 2) => String(n).padStart(len, "0")

    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const ms = pad(now.getMilliseconds(), 3)

    return withDash ? `${date}-${time}.${ms}` : `${date}${time}.${ms}`
}

function playSound(path: string) {
    execAsync(["canberra-gtk-play", "-f", expandHome(path)]).catch((err) =>
        console.error("[screen-capture] sound playback failed:", err)
    )
}

function ensureDir(path: string) {
    GLib.mkdir_with_parents(path, 0o755)
}

async function getActiveWindowTitle(): Promise<string> {
    try {
        const out = await execAsync(["hyprctl", "activewindow", "-j"])
        const data = JSON.parse(out)
        const title = (data.title ?? "") as string
        return title.replace(/[\/\x00-\x1F\x7F]/g, "").slice(0, 100)
    } catch {
        return ""
    }
}


//  === Video recording ===================================================

function isWfRecorderRunning(): boolean {
    try {
        exec(["pidof", "wf-recorder"])
        return true
    } catch {
        return false
    }
}

//  Reactive state - for bar indicator
export const isVideoRecording = createPoll<boolean>(false, 1000, () => isWfRecorderRunning())

export async function toggleVideoRecording() {
    if (isWfRecorderRunning()) {
        playSound(cfg.video["stop-sound"])
        launchCommand(cfg.video["stop-command"])
        return
    }

    const dir = expandHome(cfg.video["save-path"])
    ensureDir(dir)

    const file = `${dir}/videorecord-${timestamp(true)}.mp4`
    const command = cfg.video["start-command"].replace("{file}", shQuote(file))

    playSound(cfg.video["start-sound"])
    launchCommand(command)
}


//  === Screenshots ========================================================


export const Screenshot = {
    AreaToClipboard: () => {
        launchCommand(cfg.img["area-to-clipboard-command"])
    },
    AreaMarkup: () => {
        launchCommand(cfg.img["area-markup-command"])
    },
    FullscreenToClipboard: () => {
        launchCommand(cfg.img["fullscreen-to-clipboard-command"])
    },
    SaveToFolder: async () => {
        const dir = expandHome(cfg.img["save-path"])
        ensureDir(dir)

        const title = (await getActiveWindowTitle()) || "screenshot"
        const file = `${dir}/${title} - ${timestamp(false)}.png`
        const command = cfg.img["save-to-folder-command"].replace("{file}", shQuote(file))

        playSound(cfg.img["shutter-sound"])
        launchCommand(command)
    }
}








//  === Screen translate ====================================================
 
const TRANSLATE_TMP_IMAGE = "/tmp/screen-translate-shot.png"
const TRANSLATE_TMP_TEXT_BASE = "/tmp/screen-translate-text"
const TRANSLATE_TMP_TEXT = `${TRANSLATE_TMP_TEXT_BASE}.txt`
 
function notify(summary: string, body: string, critical = false) {
    const args = ["notify-send"]
    if (critical) args.push("-u", "critical", "-t", "0")
    args.push(summary, body)
 
    execAsync(args).catch((err) => console.error("[screen-capture] notify-send failed:", err))
}

function execWithInput(argv: string[], input: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const proc = Gio.Subprocess.new(argv, Gio.SubprocessFlags.STDIN_PIPE)
            proc.communicate_utf8_async(input, null, (_proc, res) => {
                try {
                    proc.communicate_utf8_finish(res)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        } catch (err) {
            reject(err)
        }
    })
}
 
function removeTempFiles() {
    for (const path of [TRANSLATE_TMP_IMAGE, TRANSLATE_TMP_TEXT]) {
        try { GLib.unlink(path) } catch { /* Ok */ }
    }
}
 
//  Area selection -> OCR -> Translate -> Clipboard + notification
export async function screenTranslate() {
    //  Empty / error slurp = cancel, silent exit
    let geometry: string
    try {
        geometry = (await execAsync(["slurp"])).trim()
        if (!geometry) return
    } catch {
        return
    }
 
    try {
        await execAsync(["grim", "-g", geometry, TRANSLATE_TMP_IMAGE])
 
        await execAsync([
            "tesseract",
            TRANSLATE_TMP_IMAGE,
            TRANSLATE_TMP_TEXT_BASE,
            "-l", cfg.translate["source-lang"],
            "--psm", cfg.translate["tesseract-psm"],
            "--oem", cfg.translate["tesseract-oem"],
        ])
 
        const sourceText = (await execAsync(["cat", TRANSLATE_TMP_TEXT])).trim()
        if (!sourceText) {
            notify("Translate", "Text not found or error")
            return
        }
 
        const translatedText = await execAsync([
            "trans", "-b", "-no-init", `:${cfg.translate["target-lang"]}`, sourceText,
        ])
 
        await execWithInput(["wl-copy"], translatedText)
        notify("Translation", translatedText, true)
    } catch (err) {
        console.error("[screen-capture] screenTranslate failed:", err)
        notify("Translate", "Text not found or error")
    } finally {
        removeTempFiles()
    }
}