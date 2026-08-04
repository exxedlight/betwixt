// QuickHub/InputSourceIndicator.tsx
import Hyprland from "gi://AstalHyprland"
import { createState } from "ags"
import languagesMap from "../../../../../configs/languages-map.json"
import { onClick } from "../../../../../lib/core/gestures"

const langMap = languagesMap as Record<string, string>

export default function InputSourceIndicator() {
    const hyprland = Hyprland.get_default()
    const [layoutVar, setLayoutVar] = createState("US");
    
    hyprland.connect("keyboard-layout", (_self, _keyboard, layout: string) => {
        const code = langMap[layout] || layout.substring(0, 2).toUpperCase()
        setLayoutVar(code)
    })

    return (
        <label 
            label={layoutVar}
            class="input-source-indicator"
            xalign={0.5}
            $={(self) => {
                onClick(() => hyprland.message("switchxkblayout current next"))(self)
            }}
        />
    )
}