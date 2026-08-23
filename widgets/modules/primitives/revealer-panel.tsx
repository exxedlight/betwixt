import { Astal, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createState } from "ags"
import { PanelProps } from "../../../lib/core/types"
import { onHover } from "../../../lib/core/gestures"
import GLib from "gi://GLib"


export default function RevealerPanel({
  name, visible, children, anchor, classes: _classes, transition, revealerClasses, onEnter, onLeave, transitionDuration
}: PanelProps) {
  // window must be visible longer from panel
  // to end of animation of <revealer>
  const [windowVisible, setWindowVisible] = createState(false)

  visible.subscribe(() => {
    if (visible()) setWindowVisible(true)
  })

  return (
    <window
      name={name}
      visible={windowVisible}
      application={app}
      layer={Astal.Layer.OVERLAY}
      monitor={0}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={anchor ?? Astal.WindowAnchor.BOTTOM}
      cssClasses={_classes}
      $={(self) => {
        onHover({
            enter: () => onEnter?.(),
            leave: () => onLeave?.(),
        })(self)
      }}
    >
      <revealer
        transitionType={transition ?? Gtk.RevealerTransitionType.CROSSFADE}
        transitionDuration={transitionDuration ?? 250}
        revealChild={visible}
        cssClasses={revealerClasses}
        $={(self) => {
          /*self.connect("notify::child-revealed", () => {
            if (!self.get_child_revealed() && !visible()) {
              setWindowVisible(false)
            }
          })*/
         self.connect("notify::child-revealed", () => {
          if (!self.get_child_revealed() && !visible()) {
            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
              setWindowVisible(false)
              return GLib.SOURCE_REMOVE
            })
          }
        })
        }}
      >
        {children}
      </revealer>
    </window>
  )
}