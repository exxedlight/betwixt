import { Gtk } from "ags/gtk4";
import { createState } from "ags";
import InputSourceIndicator from "./indicator-input-source";
import BrightnessIndicator from "./indicator-brightness";
import VolumeInputIndicator from "./indicator-volume-input";
import VolumeOutputIndicator from "./indicator-volume-output";
import { SidepanelButton } from "../../sidepanel/sidepanel";


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

            <SidepanelButton/>

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