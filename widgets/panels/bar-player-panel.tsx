import { Astal, Gtk } from "ags/gtk4";
import { cycleLoop, isPlaying, loopStatus, loopSupported, nextTrack, playerVolume, prevTrack, setVolume, shuffleEnabled, shuffleSupported, togglePlayPause, toggleShuffle, trackArtist, trackTitle } from "../../lib/services/mpris";
import { onClick, onDrag } from "../../lib/core/gestures";
import PlayerProgressBar from "../bar-modules/player/progress";
import { createComputed } from "ags";
import Pango from "gi://Pango";
import RevealerPanel from "../primitives/revealer-panel";
import { playerPanelVisible } from "../../lib/global-states";
import PlayerPlaylist from "./bar-player-playlist";


const VOLUME_SLIDER_WIDTH = 100


export default function BarPlayerPanel(){
    return RevealerPanel({
        name: "player-panel",
        visible: playerPanelVisible,
        children: <BarPlayerPanelContent />,
        anchor: Astal.WindowAnchor.TOP,
        classes: ["player-window"],
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_DOWN,
        transitionDuration: 150,
        revealerClasses: ["player-revealer"],
        valign: Gtk.Align.START
    })
}


function BarPlayerPanelContent(){
    const metaTitle = createComputed(() => 
        `${trackTitle()}${trackArtist() !== "Unknown Artist" ? ` - ${trackArtist()}` : ""}`
    )

    const loopClass = createComputed(() => {
        if (!loopSupported()) return "player-button loop unavailable"
        const status = loopStatus()
        const active = status !== "None" ? "active" : ""
        return `player-button loop ${active} loop-${status.toLowerCase()}`.trim()
    })

    const shuffleClass = createComputed(() => {
        if (!shuffleSupported()) return "player-button shuffle unavailable"
        return `player-button shuffle ${shuffleEnabled() ? "active" : ""}`.trim()
    })


    return (
        <box 
            class="bar-player-panel-content"
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
        >
            
            <box 
                class="track-title"
                orientation={Gtk.Orientation.VERTICAL}
            >
                <label
                    label={metaTitle}
                    class="track-title-label"
                    ellipsize={Pango.EllipsizeMode.END}
                    maxWidthChars={65}
                    xalign={0.5}
                    hexpand={false}
                    valign={Gtk.Align.CENTER}
                />
            </box>

            <box 
                class="player-controls"
                orientation={Gtk.Orientation.HORIZONTAL}
            >

                <centerbox class="left" orientation={Gtk.Orientation.VERTICAL} vexpand>
                    <label $type="start" halign={Gtk.Align.CENTER} hexpand={false} label="" class={loopClass}     $={onClick(() => cycleLoop())}/>
                    <label $type="end"   halign={Gtk.Align.CENTER} hexpand={false} label="" class={shuffleClass}  $={onClick(() => toggleShuffle())}/>
                </centerbox>

                <box class="center" orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} hexpand>
                    
                    <centerbox orientation={Gtk.Orientation.VERTICAL}>
                        <label $type="center" xalign={0.5} label="" class="skip prev" $={onClick(() => prevTrack())}/>
                    </centerbox>
                    
                    <box class={isPlaying.as(p => `play-pause ${p ? "playing" : "stopped"}`)} $={onClick(() => togglePlayPause())} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
                        <label xalign={0.5} label={isPlaying.as(p => p ? "" : "")}  />
                    </box>

                    <centerbox orientation={Gtk.Orientation.VERTICAL}>
                        <label $type="center" xalign={0.5} label="" class="skip next" $={onClick(() => nextTrack())}/>
                    </centerbox>
                    
                </box>
                
                <box class="right" vexpand orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
                    <VolumeSlider/>
                    <label label=""/>
                </box>

            </box>

            <PlayerProgressBar barWidth={550}/>


            <PlayerPlaylist/>
        </box>
    )
}

function VolumeSlider({ width = VOLUME_SLIDER_WIDTH }: { width?: number }) {
    return (
        <box
            class="slider volume-slider"
            widthRequest={width}
            $={onDrag((x) => {
                const pct = Math.max(0, Math.min(1, x / width))
                setVolume(pct)
            })}
        >
            <box class="volume-slider-track">
                <box
                    class="volume-slider-fill"
                    widthRequest={playerVolume.as(v => Math.round(v * width))}
                    halign={Gtk.Align.START}
                />
            </box>
        </box>
    )
}