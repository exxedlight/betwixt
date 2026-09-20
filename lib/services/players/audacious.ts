import { execAsync } from "ags/process"
import { PlayerAdapter, Playlist, PlaylistTrack } from "../../core/types"
import { launchCommand } from "../hyprland-exec"


//  My primary player is Audacious, you can adjust it to yours.
const PLAYER_CLASS = "audacious"
const PLAYER_TITLE = ".* - Audacious$"

const COMMANDS = {
    "show-window": "audtool mainwin-show on",
    "hide-window": "audtool mainwin-show off",

    "playlist-get": "audtool playlist-display",
    "playlist-name": "audtool current-playlist-name",
    "playlist-position": "audtool playlist-position",
    "playlist-jump": "audtool playlist-jump {n}",

    "playlists-number": "audtool number-of-playlists",


    "shuffle-status": "audtool playlist-shuffle-status",
    "shuffle-toggle": "audtool playlist-shuffle-toggle",

    "repeat-status": "audtool playlist-repeat-status",
    "repeat-toggle": "audtool playlist-repeat-toggle"
}


// audtool has no "toggle" or "is the main window visible" query of its own,
// so we ask Hyprland is Audacious main window currently mapped and flip audtool's show state
const IS_MAIN_WINDOW_VISIBLE =
    `hyprctl clients -j | jq -e '.[] | select(.class == "${PLAYER_CLASS}" and (.title | test("${PLAYER_TITLE}")) and .mapped)' >/dev/null`
 
export function tooglePlayerNativeWindow() {
    launchCommand(`${IS_MAIN_WINDOW_VISIBLE} && ${COMMANDS["hide-window"]} || ${COMMANDS["show-window"]}`)
}


async function query(cmd: string): Promise<string> {
    return execAsync(["bash", "-c", cmd])
}

// ---- playlist parsing ----

const HEADER_LINE = /^(\d+)\s+tracks?\.$/
const TOTAL_LINE = /^Total length:\s*(.+)$/
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
    toggleNativeWindow() {
        launchCommand(
            `${IS_MAIN_WINDOW_VISIBLE} && ${COMMANDS["hide-window"]} || ${COMMANDS["show-window"]}`
        )
    },
 
    async getPlaylist() {
        return parsePlaylist(await query(COMMANDS["playlist-get"]))
    },
 
    async getPlaylistName() {
        return (await query(COMMANDS["playlist-name"])).trim()
    },
 
    async getPlaylistsNumber() {
        const n = Number((await query(COMMANDS["playlists-number"])).trim())
        return Number.isFinite(n) ? n : 0
    },
 
    async getPlaylistPosition() {
        return parsePosition(await query(COMMANDS["playlist-position"]))
    },
 
    jumpToTrack(index) {
        launchCommand(COMMANDS["playlist-jump"].replace("{n}", String(index)))
    },
 
    async getShuffleStatus() {
        return (await query(COMMANDS["shuffle-status"])).trim().toLowerCase() === "on"
    },
    toggleShuffle() {
        launchCommand(COMMANDS["shuffle-toggle"])
    },
 
    async getRepeatStatus() {
        return (await query(COMMANDS["repeat-status"])).trim()
    },
    toggleRepeat() {
        launchCommand(COMMANDS["repeat-toggle"])
    },
}