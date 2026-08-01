import { Astal, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createState } from "ags"
import { PanelProps } from "../../../lib/core/types"


export default function RevealerPanel({
  name, visible, children, anchor, classes: _classes, transition, revealerClasses
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
    >
      <revealer
        transitionType={transition ?? Gtk.RevealerTransitionType.CROSSFADE}
        transitionDuration={250}
        revealChild={visible}
        cssClasses={revealerClasses}
        $={(self) => {
          self.connect("notify::child-revealed", () => {
            if (!self.get_child_revealed() && !visible()) {
              setWindowVisible(false)
            }
          })
        }}
      >
        {children}
      </revealer>
    </window>
  )
}