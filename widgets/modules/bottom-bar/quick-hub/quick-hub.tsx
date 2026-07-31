import { Gtk } from "ags/gtk4";
import BrightnessIndicator from "./indicators/brightness-indicator";
import InputSourceIndicator from "./indicators/input-source-indicator";
import VolumeInputIndicator from "./indicators/volume-input-indicator";
import VolumeOutputIndicator from "./indicators/volume-output-indicator";
import { createState } from "ags";

export default function QuickHub() {
    const [volumeInputVisible, setVolumeInputVisible] = createState(false);
    
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;

    const handleEnter = () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        setVolumeInputVisible(true);
    };

    const handleLeave = () => {
        if (hoverTimer) clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
            setVolumeInputVisible(false);
        }, 150); // debounce
    };

    return (
        <box class="quick-hub">
            <InputSourceIndicator/>
            <BrightnessIndicator/>


            <revealer
                transitionType={Gtk.RevealerTransitionType.FADE_SLIDE_LEFT}
                transitionDuration={300}
                revealChild={volumeInputVisible}
                >
                    <VolumeInputIndicator
                        onEnter={handleEnter} 
                        onLeave={handleLeave} 
                    />
                </revealer>
            
            <VolumeOutputIndicator
                onEnter={handleEnter} 
                onLeave={handleLeave}
            />
        </box>
    )
}