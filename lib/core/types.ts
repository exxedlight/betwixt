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
}