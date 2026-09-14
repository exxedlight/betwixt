import { Astal, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createState } from "ags"
import GLib from "gi://GLib"
import { PanelProps } from "../../lib/core/types"
import { onHover } from "../../lib/core/gestures"


export default function RevealerPanel({
  name,
  monitor,
  visible,
  children,
  anchor,
  classes: _classes,
  transition,
  transitionDuration,
  onEnter,
  onLeave,
  layer: _layer,
  exclusivity: _exclusivity,
  valign: _valign
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
      layer={_layer ?? Astal.Layer.OVERLAY}
      monitor={monitor ?? 0}
      exclusivity={_exclusivity ?? Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={anchor ?? Astal.WindowAnchor.BOTTOM}
      cssClasses={_classes ?? undefined}
      valign={_valign ?? undefined}
      $={(self) => {
        onHover({
          enter: () => onEnter?.(),
          leave: () => onLeave?.(),
        })(self)
      }}
      css={"background: transparent;"}
    >
      <revealer
        transitionType={transition ?? Gtk.RevealerTransitionType.CROSSFADE}
        transitionDuration={transitionDuration ?? 250}
        revealChild={visible}
        cssClasses={_classes ? [..._classes, "revealer"] : undefined}
        $={(self) => {
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