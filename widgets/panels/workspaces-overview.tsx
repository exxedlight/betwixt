import { Astal, Gdk, Gtk } from "ags/gtk4";
import { setWorkspacesOverviewVisible, WallpaperPath, workspacesOverviewVisible } from "../../lib/global-states";
import RevealerPanel from "../primitives/revealer-panel";
import * as Hyprland from "../../lib/services/hyprland-exec";
import { onClick } from "../../lib/core/gestures";
import { wsTextures, wsTexturesGray } from "../../lib/services/workspace-overview";

const {TOP, BOTTOM, RIGHT, LEFT} = Astal.WindowAnchor;

const COLUMNS = 3
const ROWS = 3

const fallbackTexture = Gdk.Texture.new_from_filename(WallpaperPath)

const switchWorkspace = (id: number) => {
    Hyprland.switchWorkspace(id)
    setWorkspacesOverviewVisible(false)
}


export default function WorkspaceOverview(monitor: number){
    return RevealerPanel({
        name: `workspaces-overview-${monitor}`,
        monitor, 
        visible: workspacesOverviewVisible, 
        children: <WorkspacesOverviewContent/>,
        anchor: TOP | BOTTOM | LEFT | RIGHT, 
        classes: ["workspaces-overview-window"], 
        transition: Gtk.RevealerTransitionType.CROSSFADE,
        layer: Astal.Layer.OVERLAY,
        exclusivity: Astal.Exclusivity.EXCLUSIVE,
    })
}

const ROWS_DATA = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLUMNS }, (_, c) => r * COLUMNS + c + 1)
)


function WorkspacesOverviewContent(){
    //const rows = Array.from({ length: ROWS }, (_, r) =>
    //    Array.from({ length: COLUMNS }, (_, c) => r * COLUMNS + c + 1)
    //)

    return (
        <box class="workspaces-overview" orientation={Gtk.Orientation.VERTICAL} spacing={12} hexpand vexpand>
            {ROWS_DATA.map((row) => (
                <box class="row" spacing={12} hexpand>
                    {row.map((id) => (
                        <WorkspaceCell id={id} />
                    ))}
                </box>
            ))}
        </box>
    )
}

function WorkspaceCell({ id }: { id: number }) {
    const paintable = wsTextures.as(t => t[id] ?? fallbackTexture)
    const grayPaintable = wsTexturesGray.as(t => t[id] ?? fallbackTexture)
    
    return (
        <box class="cell" $={onClick(() => switchWorkspace(id))}>
            <overlay class="thumb" hexpand>
                <Gtk.Picture
                    class="picture"
                    paintable={paintable}
                    contentFit={Gtk.ContentFit.COVER}
                />
                <Gtk.Picture
                    class="filter"
                    $type="overlay"
                    paintable={grayPaintable}
                    contentFit={Gtk.ContentFit.COVER}
                />
                <label
                    class="index"
                    $type="overlay"
                    label={String(id)}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                />
            </overlay>
        </box>
    )
}