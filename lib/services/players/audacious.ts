import { PlayerAdapter, Playlist, PlaylistTrack } from "../../core/types"
import { launchCommand } from "../hyprland-exec"


//  My primary player is Audacious, you can adjust it to yours.
const PLAYER_CLASS = "audacious"
const PLAYER_TITLE = ".* - Audacious$"

const PLAYER_SHOW_COMMAND = "audtool mainwin-show on"
const PLAYER_HIDE_COMMAND = "audtool mainwin-show off"


// audtool has no "toggle" or "is the main window visible" query of its own,
// so I ask Hyprland whether an Audacious main window is currently mapped
// and flip audtool's show state
const IS_MAIN_WINDOW_VISIBLE =
    `hyprctl clients -j | jq -e '.[] | select(.class == "${PLAYER_CLASS}" and (.title | test("${PLAYER_TITLE}")) and .mapped)' >/dev/null`
 
export function tooglePlayerNativeWindow() {
    launchCommand(`${IS_MAIN_WINDOW_VISIBLE} && ${PLAYER_HIDE_COMMAND} || ${PLAYER_SHOW_COMMAND}`)
}


// ---- playlist parsing ----

const HEADER_LINE = /^(\d+)\s+tracks?\.$/
const TOTAL_LINE = /^Total length:\s*(.+)$/
// хвостовой якорь на "число:число" в конце строки не даёт "|" в названии трека сломать разбор
const TRACK_LINE = /^\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(\d{1,2}:\d{2})\s*$/

function parsePlaylist(raw: string): Playlist {
    const tracks: PlaylistTrack[] = []
    let trackCount = 0
    let totalLength: string | undefined

    for (const line of raw.split("\n")) {
        const header = line.match(HEADER_LINE)
        if (header) { trackCount = Number(header[1]); continue }

        const total = line.match(TOTAL_LINE)
        if (total) { totalLength = total[1].trim(); continue }

        const track = line.match(TRACK_LINE)
        if (track) {
            tracks.push({
                index: Number(track[1]),
                title: track[2].trim(),
                duration: track[3],
            })
        }
    }

    return { tracks, trackCount, totalLength }
}
export function parsePosition(raw: string): number {
    const n = Number(raw.trim())
    return Number.isFinite(n) ? n : -1
}

export const audaciousAdapter: PlayerAdapter = {
    parsePlaylist,
    parsePosition,
}