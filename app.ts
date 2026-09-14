import app from "ags/gtk4/app"
import { loadStyles } from "./lib/core/styles-loader"
import { handleKeybindRequest } from "./lib/services/actions"
import { applyInitialPowerPlan } from "./lib/services/powerplans"
import TopBar from "./widgets/bar-top"
import BottomBar from "./widgets/bar-bottom"
import { SettingsWindow } from "./widgets/settings/settings-window"
import DesktopWindow from "./widgets/desktop/desktop"
import SidePanelWindow from "./widgets/sidepanel/sidepanel"
import GLib from "gi://GLib"
import System from "system"
import { monitorsCount } from "./lib/global-states"
import Lockscreen from "./widgets/lockscreen/lockscreen"


// --- Hot Reload start:
// --- find . -name "*.tsx" -name "*.ts" -o -name "*.css" | entr -r ags run ./app.ts


const style = loadStyles()


app.start({
  css: style,
  requestHandler: handleKeybindRequest,
  main() {
    applyInitialPowerPlan()
    
    //  Per-monitor cycle
    for (let i = 0; i < monitorsCount; i++) {
      TopBar(i)
      BottomBar(i)

      SettingsWindow(i)

      DesktopWindow(i)
      SidePanelWindow(i)

      Lockscreen(i)
    }

    //  force GarbageCollector call ==> 2s after startup
    GLib.timeout_add(GLib.PRIORITY_HIGH, 2000, () => {
      System.gc()
      return GLib.SOURCE_REMOVE
    })
  },
})
