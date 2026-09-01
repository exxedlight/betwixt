import { Accessor } from "ags"
import { Astal, Gtk } from "ags/gtk4"

export type PanelProps = {
    name: string
    visible: Accessor<boolean>
    children?: JSX.Element | JSX.Element[]
    anchor?: Astal.WindowAnchor
    classes?: string[]
    revealerClasses: string[]
    transition?: Gtk.RevealerTransitionType | Accessor<NonNullable<Gtk.RevealerTransitionType | undefined>> | undefined;
    transitionDuration?: number;
    valign?: Gtk.Align;

    onEnter?: () => void;
    onLeave?: () => void;
}

export type DesktopPreferences = {
    "grid-size": [number, number]
    "icon-size": [number, number]
    spacing: [number, number],
    "icons-font-size": number
}
export type DesktopItem = {
    pos: [number, number]
    icon: string
    label: string
    command: string
}
export type DesktopConfig = {
    preferences: DesktopPreferences
    items: DesktopItem[]
}


export type PlayerConfig = {
    "show-window"?: string
    "hide-window"?: string
    "playlist-get"?: string
    "playlist-name"?: string
    "playlist-jump"?: string
    "playlists-number"?: string
    "shuffle-status"?: string
    "shuffle-toggle"?: string
    "repeat-status"?: string
    "repeat-toggle"?: string
    "playlist-position"?: string
}
export type PlayersConfig = Record<string, PlayerConfig>

export type PlaylistTrack = {
    index: number
    title: string
    duration: string // "3:58"
}

export type Playlist = {
    tracks: PlaylistTrack[]
    trackCount: number
    totalLength?: string
}

export type PlayerAdapter = {
    parsePlaylist: (raw: string) => Playlist
    parsePosition: (raw: string) => number
}