import { getPlayerAdapter } from "../../lib/services/players"
import { Mpris } from "../../lib/services/mpris"
import { Playlist, PlaylistTrack } from "../../lib/core/types"
import { Gtk } from "ags/gtk4"
import { createState, For } from "ags"
import Pango from "gi://Pango"
import { onClick } from "../../lib/core/gestures"

const emptyPlaylist: Playlist = { tracks: [], trackCount: 0 }

async function fetchPlaylist(): Promise<Playlist> {
    const adapter = getPlayerAdapter(Mpris.activePlayerName())
    if (!adapter?.getPlaylist) return emptyPlaylist
    try { return await adapter.getPlaylist() }
    catch { return emptyPlaylist }
}
 
async function fetchPlaylistPosition(): Promise<number> {
    const adapter = getPlayerAdapter(Mpris.activePlayerName())
    if (!adapter?.getPlaylistPosition) return -1
    try { return await adapter.getPlaylistPosition() }
    catch { return -1 }
}
 
function jumpToTrack(index: number, currentPosition: number) {
    if (index === currentPosition) return
    const adapter = getPlayerAdapter(Mpris.activePlayerName())
    adapter?.jumpToTrack?.(index)
}

export default function PlayerPlaylist() {
    const [playlist, setPlaylist] = createState<Playlist>(emptyPlaylist)
    const [position, setPosition] = createState<number>(-1)

    let lastKey = ""
    let unsubscribe: (() => void) | null = null

    async function onTrackMaybeChanged() {
        const key = `${Mpris.trackTitle()}::${Mpris.trackArtist()}`
        if (key === lastKey) return
        lastKey = key

        const newPos = await fetchPlaylistPosition()
        setPosition(newPos)

        setPlaylist(await fetchPlaylist())
    }



    return (
        
            <scrolledwindow 
                class="playlist" 
                vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                hscrollbarPolicy={Gtk.PolicyType.NEVER}
                heightRequest={playlist.as(p => p.trackCount > 0 ? 300 : 0)}
                $={(self: Gtk.Widget) => {
                    self.connect("map", () => {
                        lastKey = ""
                        onTrackMaybeChanged()
                        unsubscribe = Mpris.trackTitle.subscribe(onTrackMaybeChanged)
                    })
                    self.connect("unmap", () => {
                        unsubscribe?.()
                        unsubscribe = null
                        setPlaylist(emptyPlaylist)
                        setPosition(-1)
                    })
                }}
            >
                <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["playlist-box"]}>
                    <For each={playlist.as(p => p.tracks)}>
                        {(track: PlaylistTrack) => (
                            <box
                                orientation={Gtk.Orientation.HORIZONTAL}
                                cssClasses={position.as(pos =>
                                    pos === track.index
                                        ? ["track-row", "active"]
                                        : ["track-row"]
                                )}
                                $={onClick(() => { jumpToTrack(track.index, position()) })}
                            >
                                <label
                                    cssClasses={["track-row-title"]}
                                    label={`${track.index}. ${track.title}`}
                                    xalign={0}
                                    maxWidthChars={40}
                                    ellipsize={Pango.EllipsizeMode.END}
                                    hexpand
                                />
                                <label
                                    cssClasses={["track-row-duration"]}
                                    label={track.duration}
                                    xalign={1}
                                />
                            </box>
                        )}
                    </For>
                </box>
            </scrolledwindow>
    )
}