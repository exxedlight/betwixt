import { Gtk } from "ags/gtk4";

type DayData = {
    day: string
    icon: string
    tempHigh: number
    tempLow: number
}

function DayPill({ day, icon, tempHigh, tempLow }: DayData){
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
                <label class="weather-day-name" label={day} xalign={0.5} />
                <label class="weather-day-icon" label={icon} xalign={0.5} />
                <box class="weather-temps" orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
                    <label class="weather-temp-high" label={`${tempHigh}°`} xalign={0.5} />
                    <label class="weather-temp-low" label={`${tempLow}°`} xalign={0.5} />
                </box>
            </box>
            
        </box>
    )
}

// Mock data for styling
const mockDays: DayData[] = [
    { day: "Mon", icon: "󰖙", tempHigh: 22, tempLow: 14 },  // sunny
    { day: "Tue", icon: "󰖐", tempHigh: 19, tempLow: 12 },  // cloudy
    { day: "Wed", icon: "󰼰", tempHigh: 16, tempLow: 10 },  // rain
    { day: "Thu", icon: "󰖝", tempHigh: 24, tempLow: 15 },  // sun
    { day: "Fri", icon: "󰼴", tempHigh: 18, tempLow: 11 },  // thunderstorm
]

export default function WeatherRow(){
    return (
        <box
            class="weather-row"
            orientation={Gtk.Orientation.HORIZONTAL}
            hexpand
            spacing={8}
            
        >

            {mockDays.map((day) => (
                <DayPill {...day} />
            ))}

        </box>
    )
}