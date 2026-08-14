import { createPoll } from "ags/time"

export const CurrentTime = createPoll("", 1000, () => new Date().toLocaleTimeString("ru-RU", { hour12: false }))
export const CurrentDate = createPoll(
    { 
        time: "", 
        date: "",          // "14.08.26"
        date_short: "",    // "14.08"
        month: "",         // "August"
        weekday: "",       // "Thu"
        isoDate: "",       // "2026-08-14"  ==> for comparing with API dates
        day: 0,            // numeric day
        monthNum: 0,       // 1-12
        year: 0,           // full year
    }, 
    60_000, 
    () => {
        const d = new Date()
        return {
            time: d.toLocaleTimeString("en-GB", { hour12: false }),
            date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }),
            date_short: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
            month: d.toLocaleDateString("en-US", { month: "long" }),
            weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
            isoDate: d.toISOString().slice(0, 10),  // YYYY-MM-DD
            day: d.getDate(),
            monthNum: d.getMonth() + 1,
            year: d.getFullYear(),
        }
    }
)