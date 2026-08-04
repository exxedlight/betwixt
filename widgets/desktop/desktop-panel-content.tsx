import { Gdk, Gtk } from "ags/gtk4"
import { createState, With } from "ags"
import { DesktopConfig } from "../../lib/core/types"
import GLib from "gi://GLib"
import { monitorFile } from "ags/file"
import { onClick } from "../../lib/core/gestures"
import { launchCommand, swithToEmptyWorkspace } from "../../lib/services/hyprland-exec"
import { toggleDesktop } from "../../lib/global-states"
import { desktopConfig } from "../../lib/services/desktop"

function getPrimaryMonitorWidth(): number {
    const monitor = Gdk.Display.get_default()?.get_monitors().get_item(0) as Gdk.Monitor | null
    return monitor?.get_geometry().width ?? 1920 // fallback
}

//const CONFIG_PATH = `${SRC}/configs/desktop.json`

/*function loadConfig(): DesktopConfig | null {
    try {
        const [ok, bytes] = GLib.file_get_contents(CONFIG_PATH)
        if (!ok) return null
        const text = new TextDecoder().decode(bytes)
        return JSON.parse(text) as DesktopConfig
    } catch (e) {
        console.error("Desktop config error:", e)
        return null
    }
}*/

// Reactive config
//const [config, setConfig] = createState<DesktopConfig | null>(loadConfig())

// most editors trigger more than one filesystem event per write so debounce here.
//let reloadTimeoutId: number | null = null

/*monitorFile(CONFIG_PATH, () => {
    if (reloadTimeoutId) GLib.source_remove(reloadTimeoutId)

    reloadTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 150, () => {
        reloadTimeoutId = null
        console.log("[desktop] config changed, reloading")
        setConfig(loadConfig())
        return GLib.SOURCE_REMOVE
    })
})*/

export default function DesktopPanelContent() {
    const panelWidth = Math.round(getPrimaryMonitorWidth() * 0.7)
    const handleClose = () => toggleDesktop()

    const [glowCss, setGlowCss] = createState("")

    const attachGlow = (self: Gtk.Widget) => {
        const motion = new Gtk.EventControllerMotion()
 
        motion.connect("motion", (_ctl, x: number, y: number) => {
            // Swap this rgba for your actual accent color (or an
            // @define-color name if you have GTK-native color vars — SCSS
            // $variables aren't available here, this string is built at
            // runtime, after SCSS has already compiled away).
            
            //  Light
            setGlowCss(`
                background-image: 
                    radial-gradient(circle 450px at ${x}px ${y}px, rgba(90, 34, 93, 0.07), transparent 70%),
                    radial-gradient(circle 650px at ${x}px ${y}px, rgba(186, 128, 198, 0.04), transparent 70%)
                ;
            `)

            //  Dark
            /*setGlowCss(`
                background-image: 
                    radial-gradient(circle 1550px at ${x}px ${y}px, rgba(0, 0, 0, 0.8), transparent 70%)
                ;
            `)*/
            //  radial-gradient(circle 650px at ${x}px ${y}px, rgba(132, 37, 124, 0.15), transparent 70%)
        })
 
        motion.connect("leave", () => setGlowCss(""))
 
        self.add_controller(motion)
    }

    return (
        <box
            class="desktop-panel-content"
            vexpand
            widthRequest={panelWidth}
            orientation={Gtk.Orientation.VERTICAL}
            //css={glowCss.as(c => c)}
            //$={(self) => attachGlow(self)}
        >
            <box class="desktop-wrapper" orientation={Gtk.Orientation.VERTICAL}>

                <box class="desktop-header" orientation={Gtk.Orientation.HORIZONTAL} hexpand heightRequest={50}>
                    Desktop
                </box>

                <With value={desktopConfig}>
                    {(cfg) => !cfg ? (
                        <label class="desktop-config-error" label="Desktop config error — check configs/desktop.json" />
                    ) : (
                        <box 
                            class="desktop-grid" 
                            orientation={Gtk.Orientation.VERTICAL} 
                            spacing={cfg.preferences.spacing[1]}
                            
                        >
                            {Array.from({ length: cfg.preferences["grid-size"][1] }, (_, row) => (
                                //  Grid rows definition
                                <box
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    class="desktop-grid-row"
                                    hexpand
                                    spacing={cfg.preferences.spacing[0]}
                                >
                                    {Array.from({ length: cfg.preferences["grid-size"][0] }, (_, col) => {
                                        //  Inside every row ==> Cell definition
                                        //  Inside every cell ==> icon in config?
                                        const item = cfg.items.find(i => i.pos[0] === col && i.pos[1] === row)

                                        return (
                                            <box
                                                orientation={Gtk.Orientation.VERTICAL}
                                                valign={Gtk.Align.START}
                                                class="desktop-grid-cell"
                                                hexpand
                                            >
                                                {/* Icon render, if no icon, renders empty cell */}
                                                <overlay
                                                    class="desktop-icon"
                                                    heightRequest={cfg.preferences["icon-size"][1]}
                                                    widthRequest={cfg.preferences["icon-size"][0]}
                                                    valign={Gtk.Align.START}
                                                    halign={Gtk.Align.CENTER}
                                                    $={onClick(() => {
                                                        if (item) {
                                                            swithToEmptyWorkspace()
                                                            launchCommand(item.command)
                                                            toggleDesktop()
                                                        }
                                                    })}
                                                >
                                                    {item && (
                                                        <>
                                                            <label
                                                                class="desktop-icon-glyph"
                                                                label={item.icon}
                                                                css={`font-size: ${cfg.preferences["icons-font-size"]}px;`}
                                                            />
                                                            <label
                                                                $type="overlay"
                                                                class="desktop-icon-label"
                                                                label={item.label}
                                                                wrap
                                                                xalign={0.5}
                                                                valign={Gtk.Align.START}
                                                                justify={Gtk.Justification.CENTER}
                                                                css={`margin-top: ${cfg.preferences["icon-size"][1] + 3}px;`}
                                                            />
                                                        </>
                                                    )}
                                                </overlay>
                                            </box>
                                        )
                                    })}
                                </box>
                            ))}
                        </box>
                    )}
                </With>
            </box>
        </box>
    )
}