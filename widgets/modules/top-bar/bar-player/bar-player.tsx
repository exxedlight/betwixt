import { Gtk } from "ags/gtk4"
import { onClick } from "../../../../lib/core/gestures"
import {
    trackTitle,
    isPlaying,
    togglePlayPause,
} from "../../../../lib/services/mpris"

import Cava from "./modules/cava"
import ProgressBar from "./modules/progress"
import Pango from "gi://Pango"
import { tooglePlayerNativeWindow } from "../../../../lib/services/player-toogle"

const META_WIDTH = 250
// Slightly under META_WIDTH so the ellipsis has a little breathing room
// before it visually touches the edge of the column.
const TITLE_WIDTH = 220

export default function BarPlayer() {
    return (
        <box class="bar-player">
            <box class={isPlaying.as(p => `play-pause ${p ? "playing" : "stopped"}`)}>
                <label
                    xalign={0.5}
                    label={isPlaying.as(p => p ? "󰏤" : "󰐊")}
                    $={onClick(() => togglePlayPause())}
                />
            </box>

            <box
                class="meta-progress"
                orientation={Gtk.Orientation.VERTICAL}
                widthRequest={META_WIDTH}
            >
                <ProgressBar barWidth={META_WIDTH} />
                <box class="meta" widthRequest={META_WIDTH} valign={Gtk.Align.END}>
                    <label
                        label={trackTitle}
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

            <Cava />
        </box>
    )
}