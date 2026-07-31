import { Gtk } from "ags/gtk4"
import { createComputed } from "ags"
import { activePowerPlan, setPowerPlan } from "../../../../../lib/services/powerplans"
import { onClick } from "../../../../../lib/core/gestures"

export default function PowerModes() {
    const isUltraEco = createComputed(() => activePowerPlan() === "ultra-eco")

    const modesClass = createComputed(() => `eco-modes${isUltraEco() ? " ultra-eco-mode" : ""}`)
    const ultraEcoClass = createComputed(() => `power-button ultra-eco-button${isUltraEco() ? " ultra-eco-mode" : ""}`)

    const ecoClass = createComputed(() => {
        let cls = "power-button eco-button"
        if (isUltraEco()) cls += " ultra-eco-mode"
        else if (activePowerPlan() === "eco") cls += " active"
        return cls
    })

    const balancedClass = createComputed(() => `power-button ballanced-button${activePowerPlan() === "balanced" ? " active" : ""}`)
    const performanceClass = createComputed(() => `power-button performance-button${activePowerPlan() === "performance" ? " active" : ""}`)

    return (
        <box class="power-modes" halign={Gtk.Align.START}>
            <box class={modesClass}>
                <label
                    label="󱈑"
                    class={ultraEcoClass}
                    halign={Gtk.Align.CENTER}
                    $={(self) => onClick({ primary: () => setPowerPlan("ultra-eco") })(self)}
                />
                <label
                    label=""
                    class={ecoClass}
                    halign={Gtk.Align.CENTER}
                    $={(self) => onClick({ primary: () => setPowerPlan("eco") })(self)}
                />
            </box>
            <label
                label="󰾅"
                class={balancedClass}
                halign={Gtk.Align.CENTER}
                $={(self) => onClick({ primary: () => setPowerPlan("balanced") })(self)}
            />
            <label
                label="󱐌"
                class={performanceClass}
                halign={Gtk.Align.CENTER}
                $={(self) => onClick({ primary: () => setPowerPlan("performance") })(self)}
            />
        </box>
    )
}