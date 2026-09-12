import { execAsync } from "ags/process"

export function notify(summary: string, body: string, critical = false) {
    const args = ["notify-send"]
    if (critical) args.push("-u", "critical", "-t", "0")
    args.push(summary, body)
 
    execAsync(args).catch((err) => console.error("[screen-capture] notify-send failed:", err))
}