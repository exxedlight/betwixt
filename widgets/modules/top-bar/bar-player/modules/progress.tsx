import { Gdk, Gtk } from "ags/gtk4"
import { playbackPercentage, seekTo } from "../../../../../lib/services/mpris"

type Props = {
    barWidth: number
}

export default function ProgressBar({ barWidth }: Props) {
    return (
        <box
            class="progress-bar-container"
            valign={Gtk.Align.CENTER}
            widthRequest={barWidth}
            $={(self) => {
                const click = new Gtk.GestureClick()
                click.set_button(Gdk.BUTTON_PRIMARY)

                click.connect("released", (gesture, _n_press, x: number, y: number) => {
                    // Coordinates relative to the container (self), not the
                    // widget the gesture was captured on
                    const [, containerX] = self.translate_coordinates(
                        gesture.get_widget()!,
                        x,y
                    )

                    if (barWidth === 0) return

                    const pct = Math.max(0, Math.min(1, containerX / barWidth))
                    seekTo(pct)
                })

                self.add_controller(click)
            }}
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