import Gtk from "gi://Gtk?version=4.0"
import { Gdk } from "ags/gtk4"

type ClickHandlers = {
  primary?: () => void   // LMB
  secondary?: () => void // RMB
  middle?: () => void    // MMB
}
type ScrollHandlers = {
  up?: () => void
  down?: () => void
}
type HoverHandlers = {
  enter?: () => void
  leave?: () => void
}


// LMB shortcut:  $={onClick(() => ...)}
export function onClick(handlers: (() => void) | ClickHandlers) {
  const map: ClickHandlers =
    typeof handlers === "function" ? { primary: handlers } : handlers

  return (self: Gtk.Widget) => {
    const click = new Gtk.GestureClick()
    click.set_button(0) // Listen any mouse key

    click.connect("released", (gesture) => {
      const button = gesture.get_current_button()

      if (button === Gdk.BUTTON_PRIMARY) map.primary?.()
      else if (button === Gdk.BUTTON_SECONDARY) map.secondary?.()
      else if (button === Gdk.BUTTON_MIDDLE) map.middle?.()
    })

    self.add_controller(click)
  }
}


// Enter only shortcut: $={onHover(() => ...)}
export function onHover(handlers: (() => void) | HoverHandlers) {
  const map: HoverHandlers =
    typeof handlers === "function" ? { enter: handlers } : handlers

  return (self: Gtk.Widget) => {
    const motion = new Gtk.EventControllerMotion()

    if (map.enter) {
      motion.connect("enter", () => map.enter?.())
    }
    if (map.leave) {
      motion.connect("leave", () => map.leave?.())
    }

    self.add_controller(motion)
  }
}


export function onScroll(handlers: ScrollHandlers) {
  return (self: Gtk.Widget) => {
    const scroll = new Gtk.EventControllerScroll()

    scroll.set_flags(Gtk.EventControllerScrollFlags.VERTICAL)

    scroll.connect("scroll", (_controller, _dx, dy) => {
      if (dy < 0) handlers.up?.()
      else if (dy > 0) handlers.down?.()
      return true
    })

    self.add_controller(scroll)
  }
}