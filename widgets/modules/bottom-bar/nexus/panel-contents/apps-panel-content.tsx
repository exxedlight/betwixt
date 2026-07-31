import Gtk from "gi://Gtk?version=4.0"
import Apps from "gi://AstalApps"
import { createComputed, createState } from "ags"
import { Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"

type Props = {
    onClose: () => void
}

export default function AppsPanelContent({ onClose }: Props) {
    const [query, setQuery] = createState("")

    const appsService = new Apps.Apps()

    // Сopy the array with [...] so sort() doesn't mutate original list
    const allApps = [...appsService.list].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    )

    //  Enter point to panel close event
    const handleClose = () => {
        setQuery("")    //  clearing the entry
        onClose()
    }

    // Desktop entries can contain field codes (%u, %f, %U, %F, %i, %c, %k) in
    // their Exec= line. We striping them by hand.
    const FIELD_CODE_RE = /\s*%[fFuUick]\b/g
    function stripFieldCodes(exec: string): string {
        return exec.replace(FIELD_CODE_RE, "").replace(/%%/g, "%").trim()
    }

    // Hyprland 0.55+ (Lua config)
    // Exec dispatcher is `hl.dsp.exec_cmd("<command>")`
    function toLuaStringLiteral(value: string): string {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
    }

    // Neither app.launch() nor a raw GLib spawn from inside AGS actually
    // detaches the child: cgroup membership is inherited on fork() no matter
    // which spawn API is used, so if AGS ends up killed with KillMode=control-group
    // (systemd user service, or however it's supervised), every child spawned
    // by AGS dies with it — session/process-group tricks like setsid don't
    // touch cgroups at all.
    //
    // The actual fix is to not be the one spawning the process. Hyprland is a
    // separate long-running daemon in its own cgroup, and dispatching exec
    // through it asks it to fork+exec the command itself. The real parent
    // process is then Hyprland, completely outside AGS's process tree —
    // `ags quit` can no longer take it down.
    const launchApp = (app: Apps.Application) => {
        //  -- 1.   Connects process to AGS
        //  --      if AGS falls, all this processes will be killed
        //  app.launch();
        //  ----------------------------------

        //  -- 2.  Connects process to Hyprland
        //  --     if AGS falls, all processes will be exist
        const command = stripFieldCodes(app.executable)
        const luaExpr = `hl.dsp.exec_cmd(${toLuaStringLiteral(command)})`

        execAsync(["hyprctl", "dispatch", luaExpr]).catch((err) =>
            console.error(`Failed to launch "${app.name}":`, err)
        )
        //  ----------------------------------

        handleClose()
    }

    return (
        <box
            class="app-launcher-panel"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
            $={(self) => {
                // Catch Esc to close the panel
                const keyController = new Gtk.EventControllerKey()
                keyController.connect("key-pressed", (_controller, keyval) => {
                    if (keyval === Gdk.KEY_Escape) {
                        handleClose()
                        return true // stop event propagation
                    }
                    return false
                })
                self.add_controller(keyController)
            }}
        >
            <centerbox class="header">
                <label $type="start" label="Applications" class="panel-title" />
                <button class="close-button" $type="end" label="" onClicked={handleClose} />
            </centerbox>

            <entry
                class="app-search-entry"
                placeholderText="Search applications..."
                xalign={0.5}
                $={(self) => {
                    self.connect("changed", () => setQuery(self.text))

                    query.subscribe(() => {
                        if (query() === "" && self.text !== "") {
                            self.text = ""
                        }
                    })

                    // Launch the first VISIBLE app on Enter
                    self.connect("activate", () => {
                        const q = query().toLowerCase()
                        const firstMatch = allApps.find(app =>
                            !q ||
                            app.name.toLowerCase().includes(q) ||
                            (app.description && app.description.toLowerCase().includes(q))
                        )
                        if (firstMatch) {
                            launchApp(firstMatch)
                        }
                    })

                    self.connect("map", () => self.grab_focus())
                }}
            />

            <scrolledwindow
                class="app-list-scroll"
                vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                hscrollbarPolicy={Gtk.PolicyType.NEVER}
                heightRequest={300}
            >
                <box class="items-box" orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                    {/* Render ALL apps exactly once */}
                    {allApps.map((app) => {
                        // Per-app visibility mini-state
                        const isVisible = createComputed(() => {
                            const q = query().toLowerCase()
                            if (!q) return true // no query -> show everything

                            return app.name.toLowerCase().includes(q) ||
                                   (app.description && app.description.toLowerCase().includes(q)) || false
                        })

                        return (
                            <button
                                class="app-item"
                                tooltipText={app.description || ""}
                                visible={isVisible} // GTK hides the widget without freeing it from memory
                                onClicked={() => launchApp(app)}
                            >
                                <box spacing={8} hexpand>
                                    <label label={app.name} xalign={0} hexpand />
                                </box>
                            </button>
                        )
                    })}
                </box>
            </scrolledwindow>
        </box>
    )
}