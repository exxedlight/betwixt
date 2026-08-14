import { createComputed, createState, For } from "ags";
import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import { CurrentDate, CurrentTime } from "../../../lib/services/date-time";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function Clock(){

    // single tick for all three labels
    /*const now = createPoll({ time: "", date: "", month: "" }, 1000, () => {
        const d = new Date()
        return {
            time: d.toLocaleTimeString("en-GB", { hour12: false }),
            date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }),
            month: d.toLocaleDateString("en-US", { month: "long" }),
        }
    })*/
    return (
        <centerbox class="clock-circle" orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
            <box $type="center" class="wrapper" valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} orientation={Gtk.Orientation.VERTICAL}>
                <label class="clock-time"  label={CurrentTime.as(t => t)}  xalign={0.5} hexpand={false} halign={Gtk.Align.CENTER} />
                <label class="clock-date"  label={CurrentDate.as(d => d.date)}  xalign={0.5} />
                <label class="clock-month" label={CurrentDate.as(d => d.month)} xalign={0.5} />
            </box>
        </centerbox>
    )
    
}

function Calendar(){
    const [displayed, setDisplayed] = createState(GLib.DateTime.new_now_local())

    // 7-column rows; nulls pad first/last week
    const rows = createComputed(() => {
        const dt = displayed()
        const first = GLib.DateTime.new_local(dt.get_year(), dt.get_month(), 1, 0, 0, 0)
        const offset = (first.get_day_of_week() + 6) % 7   // Mon = 0
        const cells: (number | null)[] = [
            ...Array.from({ length: offset }, () => null),
            ...Array.from(
                { length: GLib.Date.get_days_in_month(dt.get_month(), dt.get_year()) },
                (_, i) => i + 1,
            ),
        ]
        while (cells.length % 7 !== 0) cells.push(null)
        const out: (number | null)[][] = []
        for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7))
        return out
    })

    /*const isToday = (day: number) => {
        const dt = displayed()
        const t = CurrentDate()  // reading global poll
        return day === t.day
            && dt.get_month() === t.monthNum
            && dt.get_year() === t.year
    }*/
    const isTodayClass = createComputed(() => {
        const t = CurrentDate()
        const dt = displayed()
        return (day: number | null) =>
            day !== null && day === t.day && dt.get_month() === t.monthNum && dt.get_year() === t.year
                ? "calendar-day today"
                : "calendar-day"
    })

    return (
        <box class="calendar" orientation={Gtk.Orientation.VERTICAL} spacing={6} valign={Gtk.Align.CENTER}>

            <centerbox class="calendar-header">
                <button $type="start" class="calendar-nav" label={"<"}
                    onClicked={() => setDisplayed(d => d.add_months(-1) ?? d)} />
                <label $type="center" class="calendar-title"
                    label={displayed.as(d => d.format("%B %Y") ?? "")} />
                <button $type="end" class="calendar-nav" label={">"}
                    onClicked={() => setDisplayed(d => d.add_months(1) ?? d)} />
            </centerbox>

            <box class="days-grid" orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.END}>
                <box class="calendar-weekdays" spacing={4}>
                    {WEEKDAYS.map(w => <label class="calendar-weekday" label={w} hexpand xalign={0.5} />)}
                </box>
                
                <For each={rows}>
                    {(row) => (
                        <box class="calendar-row" spacing={4}>
                            {row.map((day) => (
                                <label
                                    class={isTodayClass.as(fn => fn(day))}
                                    label={day !== null ? String(day) : ""}
                                    hexpand
                                    xalign={0.5}
                                />
                            ))}
                        </box>
                    )}
                </For>
            </box>

            
        </box>
    )
}



export default function DateTimeWidget(){
    return (
        <box
            class="date-time-block"
            orientation={Gtk.Orientation.HORIZONTAL}
            hexpand
        >

            <Clock/>
            <Calendar/>

        </box>
    )
}