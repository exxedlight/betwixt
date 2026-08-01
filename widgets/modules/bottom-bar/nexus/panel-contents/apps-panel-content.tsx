import Gtk from "gi://Gtk?version=4.0"
import Apps from "gi://AstalApps"
import { createComputed, createState } from "ags"
import { Gdk } from "ags/gtk4"
import { launchApp } from "../../../../../lib/services/hyprland-exec"
import { onEsc } from "../../../../../lib/core/gestures"

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

    return (
        <box
            class="app-launcher-panel"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
            $={onEsc(() => handleClose())}
        >
            <centerbox class="header">
                <label $type="start" label="Applications" class="panel-title" />
                <button class="close-button" $type="end" label="" onClicked={handleClose} />
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
                            //launchApp(firstMatch)
                            launchApp(firstMatch, handleClose);
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
                                onClicked={() => launchApp(app, handleClose)}
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