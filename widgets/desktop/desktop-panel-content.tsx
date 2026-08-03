import { Gdk, Gtk } from "ags/gtk4"
import { DesktopConfig } from "../../lib/core/types"
import GLib from "gi://GLib"
import { onClick } from "../../lib/core/gestures"
import { launchCommand, swithToEmptyWorkspace } from "../../lib/services/hyprland-exec"
import { toggleDesktop } from "../../lib/global-states"

function getPrimaryMonitorWidth(): number {
    const monitor = Gdk.Display.get_default()?.get_monitors().get_item(0) as Gdk.Monitor | null
    return monitor?.get_geometry().width ?? 1920 // fallback
}

const CONFIG_PATH = `${SRC}/configs/desktop.json`
function loadConfig(): DesktopConfig | null {
    try {
        const [ok, bytes] = GLib.file_get_contents(CONFIG_PATH)
        if (!ok) return null
        const text = new TextDecoder().decode(bytes)
        return JSON.parse(text) as DesktopConfig
    } catch (e) {
        console.error("Desktop config error:", e)
        return null
    }
}


export default function DesktopPanelContent() {
    const panelWidth = Math.round(getPrimaryMonitorWidth() * 0.7)

    const config = loadConfig();


    const handleClose = () => toggleDesktop();

    return (
        <box
            class="desktop-panel-content"
            vexpand
            widthRequest={panelWidth}
            orientation={Gtk.Orientation.VERTICAL}
        >
            
            <box class="desktop-wrapper" orientation={Gtk.Orientation.VERTICAL}>

                <box class="desktop-header" orientation={Gtk.Orientation.HORIZONTAL} hexpand heightRequest={50}>
                    Desktop
                </box>

                <box class="desktop-grid" orientation={Gtk.Orientation.VERTICAL} spacing={config?.preferences.spacing[1]}>
                    {config && 
                        
                        Array.from({ length: config.preferences["grid-size"][1] }, (_, row) => (
                        
                        //  Grid rows definition 
                        <box 
                            orientation={Gtk.Orientation.HORIZONTAL} 
                            class="desktop-grid-row"
                            hexpand
                            spacing={config.preferences.spacing[0]}
                        >

                            {Array.from({ length: config.preferences["grid-size"][0] }, (_, col) => (
                                
                                //  Inside every row ==> Cell definition
                                <box 
                                    orientation={Gtk.Orientation.VERTICAL} 
                                    valign={Gtk.Align.START}
                                    class="desktop-grid-cell"
                                    hexpand
                                >
                                    {(() => {

                                        //  Inside every cell ==> icon in config?
                                        const item = config?.items.find(i => i.pos[0] === col && i.pos[1] === row)
                                        
                                        
                                        return (
                                            //  Icon render
                                            //  If no icon, renders empty cell
                                            <overlay 
                                                class="desktop-icon"
                                                heightRequest={config!.preferences["icon-size"][1]}
                                                widthRequest={config!.preferences["icon-size"][0]}
                                                valign={Gtk.Align.START}
                                                halign={Gtk.Align.CENTER}
                                                $={onClick(() => {
                                                    if(item) {
                                                        swithToEmptyWorkspace();
                                                        launchCommand(item.command);
                                                        toggleDesktop();
                                                    }
                                                })}
                                            >
                                                
                                                {item && (
                                                    //  Icon data
                                                    <>
                                                        <label class="desktop-icon-glyph" label={item.icon} css={`font-size: ${config.preferences["icons-font-size"]}px;`} />
                                                        <label 
                                                            $type="overlay"
                                                            class="desktop-icon-label" 
                                                            label={item.label} 
                                                            wrap
                                                            xalign={0.5}
                                                            valign={Gtk.Align.START}
                                                            justify={Gtk.Justification.CENTER}
                                                            css={`margin-top: ${config.preferences["icon-size"][1]+3}px;`}
                                                        />
                                                    </>
                                                )}
                                                
                                            </overlay>
                                        )
                                    })()}
                                </box>
                            ))}
                        </box>
                    ))}
                </box>
            </box>


            
            

        </box>
    )
}