import { exec, execAsync } from "ags/process"
import Apps from "gi://AstalApps"

// Desktop entries can contain field codes (%u, %f, %U, %F, %i, %c, %k) in
// their Exec= line. We striping them by hand.
const FIELD_CODE_RE = /\s*%[fFuUick]\b/g
function stripFieldCodes(exec: string): string {
    return exec.replace(FIELD_CODE_RE, "").replace(/%%/g, "%").trim()
}

// Hyprland 0.55+ (Lua config)
// Exec dispatcher is `hl.dsp.exec_cmd("<command>")`
function toLuaStringLiteral(value: string): string {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

export const launchApp = (app: Apps.Application, closeHandler?: () => void) => {
    //  -- 1.   Connects process to AGS
    //  --      if AGS falls, all this processes will be killed
    //  app.launch();
    //  ----------------------------------

    //  -- 2.  Connects process to Hyprland
    //  --     if AGS falls, all processes will be exist
    const command = stripFieldCodes(app.executable)
    const luaExpr = `hl.dsp.exec_cmd(${toLuaStringLiteral(command)})`

    execAsync(["hyprctl", "dispatch", luaExpr]).catch((err) =>
        console.error(`Failed to launch "${app.name}":`, err)
    )
    //  ----------------------------------

    closeHandler?.()
}

//  Launch terminal command from Hyprland dispatch
export const launchCommand = (_command: string, closeHandler?: () => void) => {
    const command = stripFieldCodes(_command)
    const luaExpr = `hl.dsp.exec_cmd(${toLuaStringLiteral(command)})`

    execAsync(["hyprctl", "dispatch", luaExpr]).catch((err) =>
        console.error(`Failed to launch command "${command}":`, err)
    )

    closeHandler?.();
}

//  End session
export const exitHyprland = (closeHandler?: () => void) => {
    execAsync(["hyprctl", "dispatch", "hl.dsp.exit()"]).catch((err) =>
        console.error("Failed to exit Hyprland:", err)
    )
    closeHandler?.()
}

//  Go to first empty workspace
export const swithToEmptyWorkspace = () => {
    exec(["hyprctl", "eval", `hl.dispatch(hl.dsp.focus({ workspace = "empty" }))`])
}