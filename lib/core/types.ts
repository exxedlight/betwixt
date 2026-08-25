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

    onEnter?: () => void;
    onLeave?: () => void;
}

export type DesktopPreferences = {
    "grid-size": [number, number]
    "icon-size": [number, number]
    spacing: [number, number],
    "icons-font-size": string
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
}