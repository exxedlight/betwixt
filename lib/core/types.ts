import { Accessor } from "ags"
import { Astal, Gtk } from "ags/gtk4"

export type PanelProps = {
    name: string
    monitor: number | Accessor<number>
    visible: Accessor<boolean>
    children?: JSX.Element | JSX.Element[]
    anchor?: Astal.WindowAnchor
    classes?: string[]
    transition?: Gtk.RevealerTransitionType | Accessor<NonNullable<Gtk.RevealerTransitionType | undefined>> | undefined;
    transitionDuration?: number;
    valign?: Gtk.Align;
    layer?: Astal.Layer | Accessor<NonNullable<Astal.Layer | undefined>> | undefined
    exclusivity?: Astal.Exclusivity | Accessor<NonNullable<Astal.Exclusivity | undefined>> | undefined

    onEnter?: () => void;
    onLeave?: () => void;
}

//  --- Desktop

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
//  -----------------


//  --- Player
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

export interface PlayerAdapter {
    toggleNativeWindow?(): void
 
    getPlaylist?(): Promise<Playlist>
    getPlaylistName?(): Promise<string>
    getPlaylistsNumber?(): Promise<number>
    getPlaylistPosition?(): Promise<number>
    jumpToTrack?(index: number): void
 
    getShuffleStatus?(): Promise<boolean>
    toggleShuffle?(): void
 
    getRepeatStatus?(): Promise<string>
    toggleRepeat?(): void
}
// --------------------------

//  --- Weather
export type DayForecast = {
    day: string
    date: string
    icon: string
    condition: string
    tempHigh: number | string
    tempLow: number | string
}

export type WeatherState = {
    loading: boolean
    days: DayForecast[]
    error: string | null
}
//  -------------------------

//  --- Workspace icons
export type CompiledRule = {
  classRe?: RegExp
  titleRe?: RegExp
  icon: string
}
//  -------------------------