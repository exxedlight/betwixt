import { Astal, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createState } from "ags"

type PanelProps = {
  name: string
  visible: Accessor<boolean>
  children?: JSX.Element | JSX.Element[]
  anchor?: Astal.WindowAnchor
  class?: string
  revealerClass?: string
  transition?: Gtk.RevealerTransitionType | Accessor<NonNullable<Gtk.RevealerTransitionType | undefined>> | undefined;
}

export default function NexusPanel({
  name, visible, children, anchor, class: _class, transition, revealerClass
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
      cssClasses={[_class ?? "", "nexus-panel-window"]}
    >
      <revealer
        transitionType={transition ?? Gtk.RevealerTransitionType.CROSSFADE}
        transitionDuration={250}
        revealChild={visible}
        cssClasses={["bar-revealer", revealerClass ?? ""]}
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