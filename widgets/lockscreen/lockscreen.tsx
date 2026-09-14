import { Astal, Gtk } from "ags/gtk4";
import { lockscreenVisible } from "../../lib/global-states";
import RevealerPanel from "../primitives/revealer-panel";
import { lockscreenImagePath } from "../../lib/services/lockscreen";

const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

export default function Lockscreen(monitor: number){
    RevealerPanel({
        name: `lockscreen-${monitor}`,
        monitor: monitor,
        visible: lockscreenVisible, 
        children: <LockscreenContent/>, 
        anchor: ( TOP | BOTTOM | RIGHT | LEFT ),
        classes: ["lockscreen-window"],
        revealerClasses: ["lockscreen-revealer"],
        transition: Gtk.RevealerTransitionType.CROSSFADE,
        layer: Astal.Layer.TOP,
        exclusivity: Astal.Exclusivity.IGNORE
    })
}

function LockscreenContent(){
    const bgCss = lockscreenImagePath.as(path =>
        path
            ? `background-image: url("file://${path}"); background-size: cover; background-position: center;`
            : ""
    )

    return (
        <overlay class="lockscreen-content">
            <box class="lockscreen-bg" css={bgCss} />
            
            <centerbox $type="overlay" class="widgets" orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
                

                <box $type="center" valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
                    <label class="lock-label" label=" Не дрочи мои просторы" hexpand={false} />
                </box>
            </centerbox>

        </overlay>
    )
}