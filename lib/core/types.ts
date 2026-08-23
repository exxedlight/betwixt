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
