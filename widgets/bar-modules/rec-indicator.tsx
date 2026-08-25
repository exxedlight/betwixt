import { Gtk } from "ags/gtk4";
import { isVideoRecording, toggleVideoRecording } from "../../lib/services/screen-capture";
import { onClick } from "../../lib/core/gestures";

export default function RecordingIndicator() {
    return (
        <label
            class="video-capture-indicator-v1"
            label=" Rec" //
            xalign={0.5}
            valign={Gtk.Align.CENTER}
            heightRequest={20}
            visible={isVideoRecording.as(v => v)}
            $={onClick(() => toggleVideoRecording())}
        />
    )
}