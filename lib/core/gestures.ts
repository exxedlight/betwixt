import Gtk from "gi://Gtk?version=4.0"
import { Gdk } from "ags/gtk4"


type ClickHandlers = {
  primary?: (x: number, y: number) => void   // LMB
  secondary?: (x: number, y: number) => void // RMB
  middle?: (x: number, y: number) => void    // MMB
}
type ScrollHandlers = {
  up?: () => void
  down?: () => void
}
type HoverHandlers = {
  enter?: () => void
  leave?: () => void
}


// Prevents premature GC of controller JS-wrappers.
// "g_object_unref: assertion G_IS_OBJECT failed".
function retain(self: Gtk.Widget, controller: object) {
  const store = ((self as any)._retainedControllers ??= [])
  store.push(controller)
}


// LMB shortcut:  $={onClick(() => ...)}
export function onClick(handlers: ((x: number, y: number) => void) | ClickHandlers) {
  const map: ClickHandlers =
    typeof handlers === "function" ? { primary: handlers } : handlers

  return (self: Gtk.Widget) => {
    const click = new Gtk.GestureClick()
    click.set_button(0) // Listen any mouse key

    click.connect("released", (gesture, _n_press, x: number, y: number) => {
      const button = gesture.get_current_button()

      if (button === Gdk.BUTTON_PRIMARY) map.primary?.(x, y)
      else if (button === Gdk.BUTTON_SECONDARY) map.secondary?.(x, y)
      else if (button === Gdk.BUTTON_MIDDLE) map.middle?.(x, y)
    })

    self.add_controller(click)
    retain(self, click)
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
    retain(self, motion)
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
    retain(self, scroll)
  }
}

export function onDrag(handler: (x: number) => void) {
  return (self: Gtk.Widget) => {
    const click = new Gtk.GestureClick()
    click.set_button(Gdk.BUTTON_PRIMARY)
    click.connect("pressed", (_g, _n, x) => handler(x))
    self.add_controller(click)
    retain(self, click)

    const drag = new Gtk.GestureDrag()
    drag.set_button(Gdk.BUTTON_PRIMARY)
    let startX = 0
    drag.connect("drag-begin", (_g, x) => { startX = x })
    drag.connect("drag-update", (_g, offX) => handler(startX + offX))
    self.add_controller(drag)
    retain(self, drag)
  }
}

export function onEsc(handler: () => void){
  return (self: Gtk.Widget) => {
    const keyController = new Gtk.EventControllerKey()
    keyController.connect("key-pressed", (_controller, keyval) => {
      if (keyval === Gdk.KEY_Escape) {
          handler()
          return true // stop event propagation
      }
      return false
    })
    self.add_controller(keyController)
    retain(self, keyController)
  }
}