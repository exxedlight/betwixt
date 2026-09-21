import app from "ags/gtk4/app"
import { loadStyles } from "./lib/core/styles-loader"
import { handleKeybindRequest } from "./lib/services/actions"
import { applyInitialPowerPlan } from "./lib/services/powerplans"
import TopBar from "./widgets/bar-top"
import BottomBar from "./widgets/bar-bottom"
import { SettingsWindow } from "./widgets/settings/settings-window"
import DesktopWindow from "./widgets/panels/desktop"
import SidePanelWindow from "./widgets/sidepanel/sidepanel"
import { monitorsCount } from "./lib/global-states"
import Lockscreen from "./widgets/lockscreen/lockscreen"
import { startWorkspaceWatcher } from "./lib/services/workspace-overview"
import WorkspaceOverview from "./widgets/panels/workspaces-overview"
import { gc_force_call } from "./lib/core/helpers"


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
      WorkspaceOverview(i)
    }

    startWorkspaceWatcher();

    //  force GarbageCollector call ==> 2s after startup
    gc_force_call();
  },
})
