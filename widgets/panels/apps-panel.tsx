import { Gtk } from "ags/gtk4";
import Apps from "gi://AstalApps"
import { createComputed, createState, For } from "ags"
import { onEsc } from "../../lib/core/gestures"
import { launchApp } from "../../lib/services/hyprland-exec"
import RevealerPanel from "../primitives/revealer-panel";
import { activeNexusPanel, closeNexusPanel, NexusPanelKey } from "../../lib/global-states";
import { getSearchVariants } from "../../lib/core/dictionaries";
import Gio from "gi://Gio";

type Props = {
    onClose: () => void
}

function appIcon(app: Apps.Application): Gio.Icon {
    try {
        return Gio.icon_new_for_string(app.iconName || "application-x-executable")
    } catch {
        return Gio.icon_new_for_string("application-x-executable")
    }
}

export default function AppsPanel(monitor: number){
    return RevealerPanel({
        name: `nexus-apps-panel-${monitor}`,
        monitor: monitor,
        visible: activeNexusPanel.as((k) => k === NexusPanelKey.APPS),
        children: <AppsPanelContent onClose={closeNexusPanel} />,
        transition: Gtk.RevealerTransitionType.FADE_SLIDE_UP,
        classes: ["apps-panel"]
    })
}

function AppsPanelContent({ onClose }: Props) {
    const [query, setQuery] = createState("")

    const appsService = new Apps.Apps()
    const [rawApps, setRawApps] = createState<Apps.Application[]>(appsService.list)

    let lastReload = 0
    function reloadApps() {
        //  Timer debounce
        const now = Date.now()
        if (now - lastReload < 3000) return
        lastReload = now

        //  Reload apps
        appsService.reload()
        const list = appsService.list

        //  Check diff
        setRawApps(prev => {
            // --- if same apps ==> don't rebuild
            if (prev.length === list.length && prev.every((a, i) => a.entry === list[i]?.entry)) {
                return prev
            }
            return list
        })

    }

    const allApps = rawApps.as(list =>
        [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    )

    //  Enter point to panel close event
    const handleClose = () => { setQuery(""); onClose() }

    const queryVariants = createComputed(() => {
        const q = query()
        return q ? getSearchVariants(q).map(v => v.toLowerCase()) : null
    })

    function appMatches(app: Apps.Application, variants: string[] | null): boolean {
        if (!variants) return true
        return variants.some(v =>
            app.name.toLowerCase().includes(v) ||
            (app.description && app.description.toLowerCase().includes(v))
        )
    }

    return (
        <box
            class="app-launcher-panel"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
            $={(self) => {
                onEsc(() => handleClose())(self)
               self.connect("map", () => reloadApps() )
            }}
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
                        const variants = queryVariants()
                        const firstMatch = allApps().find(app => appMatches(app, variants))
                        if (firstMatch) {
                            launchApp(firstMatch, handleClose)
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
                    <For each={allApps}>
                        {(app) => {
                            const isVisible = createComputed(() => appMatches(app, queryVariants()))
                            return (
                                <button
                                    class="app-item"
                                    tooltipText={app.description || ""}
                                    visible={isVisible}
                                    onClicked={() => launchApp(app, handleClose)}
                                >
                                    <box spacing={8} hexpand>
                                        <image gicon={appIcon(app)} pixelSize={20} />
                                        <label label={app.name} xalign={0} hexpand />
                                    </box>
                                </button>
                            )
                        }}
                    </For>
                </box>
            </scrolledwindow>
        </box>
    )
}