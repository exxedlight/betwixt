import { For } from "ags";
import { Gtk } from "ags/gtk4";
import { DayForecast, weatherState } from "../../../lib/services/weather";
import { toShortDate } from "../../../lib/core/format";

function DayPill({ day, date, icon, condition, tempHigh, tempLow }: DayForecast) {
    return (
        <box
            class="weather-day-pill"
            orientation={Gtk.Orientation.VERTICAL}
            halign={Gtk.Align.CENTER}
            hexpand
        >
            <box
                class="pill-content"
                orientation={Gtk.Orientation.VERTICAL}
                halign={Gtk.Align.CENTER}
            >
                <label class="weather-day-name" label={`${day} ${toShortDate(date)}`} xalign={0.5} />
                <label class="weather-day-icon" label={icon} xalign={0.5} />
                <box class="weather-temps" orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
                    <label class="weather-temp-high" label={`${tempHigh}°`} xalign={0.5} hexpand />
                    <label class="weather-temp-low" label={`${tempLow}°`} xalign={0.5} hexpand />
                </box>
            </box>
        </box>
    )
}

// Mock data for styling
/*const mockDays: DayData[] = [
    { day: "Mon", icon: "󰖙", tempHigh: 22, tempLow: 14 },  // sunny
    { day: "Tue", icon: "󰖐", tempHigh: 19, tempLow: 12 },  // cloudy
    { day: "Wed", icon: "󰼰", tempHigh: 16, tempLow: 10 },  // rain
    { day: "Thu", icon: "󰖝", tempHigh: 24, tempLow: 15 },  // sun
    { day: "Fri", icon: "󰼴", tempHigh: 18, tempLow: 11 },  // thunderstorm
]*/
const PLACEHOLDERS: DayForecast[] = Array.from({ length: 5 }, () => ({
    day: "--",
    date: "--",
    icon: "",
    condition: "--",
    tempHigh: "--",
    tempLow: "--",
}))

export default function WeatherRow(){
    const days = weatherState.as((s) =>
        s.loading || s.days.length === 0 ? PLACEHOLDERS : s.days
    )

    return (
        <box
            class="weather-row"
            orientation={Gtk.Orientation.HORIZONTAL}
            hexpand
            spacing={8}
            
        >
            <For each={days}>
                {(d) => <DayPill {...d} />}
            </For>
        </box>
    )
}