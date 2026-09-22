import { Astal, Gtk } from "ags/gtk4"
import { setSettingsWindowVisible, settingsWindowVisible } from "../../lib/global-states"
import RevealerPanel from "../primitives/revealer-panel"
import { onClick } from "../../lib/core/gestures"

export function SettingsWindow(monitor: number) {
    RevealerPanel({
        name: `settings-window-${monitor}`,
        monitor: monitor,
        visible: settingsWindowVisible.as(v => v),
        children: <SettingsPanelContent />,
        
        //  PROD
        //anchor: 0,
        //  DEBUG
        anchor: Astal.WindowAnchor.RIGHT,
        
        classes: ["settings-window"],
        transition: Gtk.RevealerTransitionType.CROSSFADE,
    })
}

export default function SettingsPanelContent() {
    return (
        <box
            class="settings-panel"
            orientation={Gtk.Orientation.VERTICAL}
        >

            <centerbox
                class="panel-header"
                orientation={Gtk.Orientation.HORIZONTAL}
            >
                <label $type="start" class="title" label="Settings" />
                <label $type="end" class="close-button" label="" $={onClick(() => setSettingsWindowVisible(false))} />
            </centerbox>

            <box
                class="panel-content"
                orientation={Gtk.Orientation.HORIZONTAL}
            >

                <box
                    class="categories"
                    orientation={Gtk.Orientation.VERTICAL}
                    widthRequest={300}
                    halign={Gtk.Align.FILL}
                    vexpand
                >
                    <label xalign={0} label="  Appearance" class="category active" />
                    <label xalign={0} label="⏼  Power" class="category" />
                    <label xalign={0} label="  Screen capture" class="category" />
                </box>

                <box
                    class="category-content"
                    orientation={Gtk.Orientation.VERTICAL}
                    hexpand vexpand
                >
                    <label class="header" xalign={0} label="  Appearance" />
                    <centerbox class="row" orientation={Gtk.Orientation.HORIZONTAL}>
                        <label 
                            class="name" 
                            $type="start" 
                            label="Some setting"
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                        />
                        <box 
                            class="setting" 
                            $type="end" 
                            orientation={Gtk.Orientation.VERTICAL} 
                            valign={Gtk.Align.START}
                            halign={Gtk.Align.START}
                        >
                            <label label="aasdasd"/>
                            <label label="aasdasd"/>
                            <label label="aasdasd"/>
                            <label label="aasdasd"/>
                        </box>
                    </centerbox>
                </box>

            </box>



        </box>
    )
}