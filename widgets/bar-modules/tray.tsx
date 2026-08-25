import Tray from "gi://AstalTray"
import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"
import { onClick } from "../../lib/core/gestures"

export default function SysTray() {
  const tray = Tray.get_default()
  const items = createBinding(tray, "items")

  return (
    <box spacing={4} class="tray">
      <For each={items}>
        {(item) => <TrayItem item={item} />}
      </For>
    </box>
  )
}

function TrayItem({ item }: { item: Tray.TrayItem }) {
  const gicon = createBinding(item, "gicon")
  let popover: Gtk.PopoverMenu

  return (
    <box
      class="tray-item"
      $={(self) => {
        self.insert_action_group("dbusmenu", item.get_action_group())

        popover = new Gtk.PopoverMenu()
        popover.set_menu_model(item.get_menu_model())
        popover.set_parent(self)
        popover.set_has_arrow(true)

        onClick({
          primary: () => item.activate(0, 0),
          secondary: () => popover.popup(),
        })(self)
      }}
    >
      <image gicon={gicon} />
    </box>
  )
}
