import { Astal, Gtk } from "ags/gtk4"
import Cava from "./cava"
import PlayerProgressBar from "./progress"
import Pango from "gi://Pango"
import { createComputed } from "gnim"
import RevealerPanel from "../../primitives/revealer-panel"
import BarPlayerPanelContent from "../../panels/bar-player-panel-content"
import { playerPanelVisible, setPlayerPanelVisible } from "../../../lib/global-states"
import { isPlaying, nextTrack, prevTrack, togglePlayPause, trackArtist, trackTitle } from "../../../lib/services/mpris"
import { onClick } from "../../../lib/core/gestures"
import { tooglePlayerNativeWindow } from "../../../lib/services/players/audacious"

const META_WIDTH = 250
// Slightly under META_WIDTH so the ellipsis has a little breathing room
// before it visually touches the edge of the column.
const TITLE_WIDTH = 220

export function PlayerPanelWindow() {
    return RevealerPanel({
        name: "player-panel",
        visible: playerPanelVisible,
        children: <BarPlayerPanelContent />,
        anchor: Astal.WindowAnchor.TOP,
        classes: ["player-window"],
        transition: Gtk.RevealerTransitionType.SLIDE_LEFT,
        transitionDuration: 150,
        revealerClasses: ["player-revealer"],
        //onEnter: showPanelPlayer, 
        //onLeave: hidePanelPlayer
    })
}

export default function BarPlayer() {
    

    const metaTitle = createComputed(() => 
        `${trackTitle()}${trackArtist() !== "Unknown Artist" ? ` - ${trackArtist()}` : ""}`
    )

    return (
        <box 
            class={playerPanelVisible.as(v => `bar-player ${v ? "opened" : "closed"}`)}
            /*$={(self) => {
                onHover({
                    enter: handleEnter,
                    leave: handleLeave
                })(self)
            }}*/
        >
            <centerbox class="bar-player-button" orientation={Gtk.Orientation.VERTICAL} $={onClick(() => prevTrack())}>
                <label $type="center" label="" xalign={0.5} valign={Gtk.Align.CENTER}/>
            </centerbox>
            <box 
                class={isPlaying.as(p => `play-pause ${p ? "playing" : "stopped"}`)} 
                $={onClick(() => togglePlayPause())}
            >
                <label label={isPlaying.as(p => p ? "󰏤" : "󰐊")} xalign={0.5} />
            </box>
            <centerbox class="bar-player-button" orientation={Gtk.Orientation.VERTICAL} $={onClick(() => nextTrack())}>
                <label $type="center" label="" xalign={0.5} valign={Gtk.Align.CENTER}/>
            </centerbox>

            <box
                class="meta-progress"
                orientation={Gtk.Orientation.VERTICAL}
                widthRequest={META_WIDTH}
            >
                <PlayerProgressBar barWidth={META_WIDTH} />
                <box class="meta" widthRequest={META_WIDTH} valign={Gtk.Align.END}>
                    <label
                        label={metaTitle}
                        class="track-title"
                        ellipsize={Pango.EllipsizeMode.END}
                        maxWidthChars={38}
                        widthRequest={TITLE_WIDTH}
                        xalign={0.5}
                        valign={Gtk.Align.END}
                        $={onClick(() => tooglePlayerNativeWindow())}
                    />
                </box>
            </box>

            <Cava onClick={() => setPlayerPanelVisible(!playerPanelVisible())} />
        </box>
    )
}