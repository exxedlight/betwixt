import GLib from "gi://GLib";

//  TODO: Hyprland, Fastfetch

const HYPR_DIR = `${GLib.get_home_dir()}/.config/hypr`
const FASTFETCH_CONF = `${GLib.get_home_dir()}/.config/fastfetch/config.jsonc`

//  rgba(RRGGBBAA) -> other Alpha
function withAlpha(rgba: string, alpha: number): string {
    const hex = rgba.match(/rgba\(([0-9a-fA-F]{6})[0-9a-fA-F]{2}\)/)?.[1]
    if (!hex) return rgba
    const a = Math.round(alpha * 255).toString(16).padStart(2, "0")
    return `rgba(${hex}${a})`
}

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace("#", "")
    if (h.length === 3 || h.length === 4) h = h.split("").map(c => c + c).join("")   // #abc -> aabbcc
    const num = parseInt(h.slice(0, 6), 16)
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}



function parseColor(raw: string): [number, number, number] {
    const value = raw.trim()

    if (value.startsWith("#")) {
        return hexToRgb(value)
    }

    const match = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)
    if (match) {
        return [Number(match[1]), Number(match[2]), Number(match[3])]
    }

    throw new Error(`[hypr-theme] unrecognized color format: "${raw}"`)
}


//  Apply hyprland rgba(#hex) structure
function toHyprRgba([r, g, b]: [number, number, number], alpha: number): string {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}


function parseScssVariables(content: string): Map<string, string> {
    const map = new Map<string, string>()
    const re = /\$([\w-]+)\s*:\s*([^;]+);/g
    let m: RegExpExecArray | null
    while ((m = re.exec(content)) !== null) {
        map.set(m[1], m[2].trim())
    }
    return map
}



//  === Main ================================================================

export async function applyHyprColors() {
    const cssColorsPath = `${SRC}/styles/core/_colors.scss`

    const [ok, bytes] = GLib.file_get_contents(cssColorsPath)
    if (!ok) {
        console.error("[hypr-theme] failed to read _colors.scss")
        return
    }

    const vars = parseScssVariables(new TextDecoder("utf-8").decode(bytes))

    function getRgb(name: string): [number, number, number] | null {
        const raw = vars.get(name)
        if (!raw) {
            console.error(`[hypr-theme] variable $${name} not found in _colors.scss`)
            return null
        }
        try {
            return parseColor(raw)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    const outline = getRgb("outline")
    const glow = getRgb("glow")
    const accent2 = getRgb("accent-2")

    if (!outline || !glow || !accent2) return

    const content = [
        "return {",
        `    outline  = "${toHyprRgba(outline, 0.8)}",`,
        `    inactive = "${toHyprRgba(outline, 0.1)}",`,
        `    glow     = "${toHyprRgba(glow, 0.5)}",`,
        `    shadow   = "${toHyprRgba(accent2, 1)}",`,
        "}",
        "",
    ].join("\n")

    const path = `${HYPR_DIR}/colors.lua`
    if (!GLib.file_set_contents(path, content)) {
        console.error("[hypr-theme] failed to write colors.lua")
    }
}