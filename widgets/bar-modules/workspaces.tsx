import Hyprland from "gi://AstalHyprland"
import { createBinding, createComputed, For } from "ags"
import { exec } from "ags/process"
import { onClick } from "../../lib/core/gestures"
import { getWindowIcon } from "../../lib/services/workspace-icons"

type HyprClient = Hyprland.Client
const WORKSPACE_COUNT = 10

export default function Workspaces() {
  const hypr = Hyprland.get_default()
  const clients = createBinding(hypr, "clients")
  const focusedWorkspace = createBinding(hypr, "focusedWorkspace")

  const workspaces = createComputed(() => {
    const list = clients()
    focusedWorkspace()

    const map = new Map<number, HyprClient[]>()
    for (let id = 1; id <= WORKSPACE_COUNT; id++) {
      map.set(id, [])
    }

    for (const c of list) {
      const id = c.workspace?.id ?? 0
      if (map.has(id)) {
        map.get(id)!.push(c)
      }
    }

    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([id, clients]) => ({ id, clients }))
  })

  return (
    <box class="workspaces" spacing={2}>
      <For each={workspaces}>
        {(ws) => (
          <box
            class={focusedWorkspace.as(fw => fw?.id === ws.id ? "tab-box active" : "tab-box")}
            $={onClick(() => exec(["hyprctl", "eval", `hl.dispatch(hl.dsp.focus({ workspace = ${ws.id} }))`]))}
          >
            {ws.clients.map((client: HyprClient) => {
              const title = createBinding(client, "title")
              const icon = title.as((t) => getWindowIcon(client.class, t))
              return <label label={icon} />
            })}
          </box>
        )}
      </For>
    </box>
  )
}