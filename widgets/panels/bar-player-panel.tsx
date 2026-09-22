import { Astal, Gtk } from "ags/gtk4";
import { Mpris } from "../../lib/services/mpris";
import { onClick, onDrag } from "../../lib/core/gestures";
import PlayerProgressBar from "../bar-modules/player/progress";
import { createComputed } from "ags";
import Pango from "gi://Pango";
import RevealerPanel from "../primitives/revealer-panel";
import { playerPanelVisible } from "../../lib/global-states";
import PlayerPlaylist from "./bar-player-playlist";


const VOLUME_SLIDER_WIDTH = 100


export default function BarPlayerPanel(monitor: number){
    return RevealerPanel({
        name: `player-panel-${monitor}`,
        monitor: monitor,
        visible: playerPanelVisible,
        children: <BarPlayerPanelContent />,
        anchor: Astal.WindowAnchor.TOP,
        classes: ["player-window"],
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_DOWN,
        transitionDuration: 150,
        valign: Gtk.Align.START
    })
}


function BarPlayerPanelContent(){
    const metaTitle = createComputed(() => 
        `${Mpris.trackTitle()}${Mpris.trackArtist() !== "Unknown Artist" ? ` - ${Mpris.trackArtist()}` : ""}`
    )

    const loopClass = createComputed(() => {
        if (!Mpris.loopSupported()) return "player-button loop unavailable"
        const status = Mpris.loopStatus()
        const active = status !== "None" ? "active" : ""
        return `player-button loop ${active} loop-${status.toLowerCase()}`.trim()
    })

    const shuffleClass = createComputed(() => {
        if (!Mpris.shuffleSupported()) return "player-button shuffle unavailable"
        return `player-button shuffle ${Mpris.shuffleEnabled() ? "active" : ""}`.trim()
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
                    <label $type="start" halign={Gtk.Align.CENTER} hexpand={false} label="" class={loopClass}     $={onClick(() => Mpris.toggleLoop())}/>
                    <label $type="end"   halign={Gtk.Align.CENTER} hexpand={false} label="" class={shuffleClass}  $={onClick(() => Mpris.toggleShuffle())}/>
                </centerbox>

                <box class="center" orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} hexpand>
                    
                    <centerbox orientation={Gtk.Orientation.VERTICAL}>
                        <label $type="center" xalign={0.5} label="" class="skip prev" $={onClick(() => Mpris.prevTrack())}/>
                    </centerbox>
                    
                    <box class={Mpris.isPlaying.as(p => `play-pause ${p ? "playing" : "stopped"}`)} $={onClick(() => Mpris.togglePlayPause())} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
                        <label xalign={0.5} label={Mpris.isPlaying.as(p => p ? "" : "")}  />
                    </box>

                    <centerbox orientation={Gtk.Orientation.VERTICAL}>
                        <label $type="center" xalign={0.5} label="" class="skip next" $={onClick(() => Mpris.nextTrack())}/>
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
                Mpris.setVolume(pct)
            })}
        >
            <box class="volume-slider-track">
                <box
                    class="volume-slider-fill"
                    widthRequest={Mpris.playerVolume.as(v => Math.round(v * width))}
                    halign={Gtk.Align.START}
                />
            </box>
        </box>
    )
}