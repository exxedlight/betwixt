import { Gtk } from "ags/gtk4"
import { onClick } from "../../../lib/core/gestures"
import { playbackPercentage, seekTo } from "../../../lib/services/mpris"

type Props = {
    barWidth: number
}

export default function PlayerProgressBar({ barWidth }: Props) {
    return (
        <box
            class="progress-bar-container"
            valign={Gtk.Align.CENTER}
            widthRequest={barWidth}
            $={onClick((x) => {
                if (barWidth === 0) return
                const pct = Math.max(0, Math.min(1, x / barWidth))
                seekTo(pct)
            })}
        >
            <box
                class="progress-fill"
                css={playbackPercentage.as(pct => `
                    min-width: ${Math.round((pct / 100) * barWidth)}px;
                `)}
            />

            <box class="progress-bg" />
        </box>
    )
}