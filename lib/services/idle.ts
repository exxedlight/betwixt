import { exec, execAsync } from "ags/process"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"


//  Hypridle wrapper interface

//  Process exists ==> running (Async version)
export async function isHypridleRunningAsync(): Promise<boolean> {
    try {
        await execAsync(["pidof", "hypridle"])
        return true
    } catch {
        return false
    }
}
//  Process exists ==> running (Sync version)
export function isHypridleRunning(): boolean {
    try {
        exec(["pidof", "hypridle"])
        return true
    } catch {
        return false
    }
}

//  Monitoring
export const idleState = createPoll<boolean>(false, 1000, () => isHypridleRunning())



//  ==== SHORTCUTS TO ACTIONS ===========================================================

export const runIdleDaemon = async () => {
    if(!(await isHypridleRunningAsync())) {
        try {           GLib.spawn_command_line_async("hypridle") } 
        catch (err) {   console.error("[battery] failed to start hypridle:", err) }
    }
}
export const stopIdleDaemon = async () => execAsync(["pkill", "-f", "hypridle"]);
export const toggleIdleDaemon = async () => {
    const idleRunned = await isHypridleRunningAsync();

    if(idleRunned)  stopIdleDaemon();
    else            runIdleDaemon();
}

//  ====================================================================================