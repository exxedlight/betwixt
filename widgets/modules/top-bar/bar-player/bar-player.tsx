import { Astal, Gtk } from "ags/gtk4"
import { onClick, onHover } from "../../../../lib/core/gestures"
import {
    trackTitle,
    isPlaying,
    togglePlayPause,
    trackArtist,
} from "../../../../lib/services/mpris"

import Cava from "./modules/cava"
import PlayerProgressBar from "./modules/progress"
import Pango from "gi://Pango"
import { tooglePlayerNativeWindow } from "../../../../lib/services/player-toogle"
import { createComputed } from "gnim"
import { playerPanelVisible, setPlayerPanelVisible } from "../../../../lib/global-states"
import RevealerPanel from "../../primitives/revealer-panel"
import BarPlayerPanelContent from "./bar-player-panel-content"

const META_WIDTH = 250
// Slightly under META_WIDTH so the ellipsis has a little breathing room
// before it visually touches the edge of the column.
const TITLE_WIDTH = 220

let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    
const handleEnter = () => {
    if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
    }
    setPlayerPanelVisible(true);
};

const handleLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
        setPlayerPanelVisible(false);
    }, 150); // debounce
};

export function PlayerPanelWindow() {
    return RevealerPanel({
        name: "player-panel",
        visible: playerPanelVisible,
        children: <BarPlayerPanelContent />,
        anchor: Astal.WindowAnchor.TOP,
        classes: ["player-window"],
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_DOWN,
        transitionDuration: 150,
        revealerClasses: ["player-revealer"],
        onEnter: handleEnter, 
        onLeave: handleLeave
    })
}

export default function BarPlayer() {
    

    const metaTitle = createComputed(() => 
        `${trackTitle()}${trackArtist() !== "Unknown Artist" ? ` - ${trackArtist()}` : ""}`
    )

    /*RevealerPanel({
        name: "player-panel",
        visible: playerPanelVisible,
        children: <BarPlayerPanelContent />,
        anchor: Astal.WindowAnchor.TOP,
        classes: ["player-window"],
        transition: Gtk.RevealerTransitionType.SWING_DOWN,
        transitionDuration: 150,
        revealerClasses: ["player-revealer"],

        onEnter: handleEnter, 
        onLeave: handleLeave
    })*/

    return (
        <box 
            class={playerPanelVisible.as(v => `bar-player ${v ? "opened" : "closed"}`)}
            $={(self) => {
                onHover({
                    enter: handleEnter,
                    leave: handleLeave
                })(self)
            }}
        >
            <box 
                class={isPlaying.as(p => `play-pause ${p ? "playing" : "stopped"}`)} 
                $={onClick(() => togglePlayPause())}
            >
                <label label={isPlaying.as(p => p ? "󰏤" : "󰐊")} xalign={0.5} />
            </box>

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

            <Cava />
        </box>
    )
}