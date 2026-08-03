import { onClick } from "../../../lib/core/gestures";
import { swithToEmptyWorkspace } from "../../../lib/services/hyprland-exec";

export default function HiderButton() {
    return (
        <label
            class={"hider-btn"}
            label={""}
            $={onClick(() => swithToEmptyWorkspace())}
        />
    )
}